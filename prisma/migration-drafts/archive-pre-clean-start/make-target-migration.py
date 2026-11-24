import sys,re
src,dst=sys.argv[1],sys.argv[2]
s=open(src).read()
s='\n'.join(l for l in s.split('\n') if not l.startswith('◇'))
def must(old,new):
    global s
    assert s.count(old)==1,(old,s.count(old))
    s=s.replace(old,new)
alter_tables=[m.group(1) for m in re.finditer(r'ALTER TABLE "(\w+)"[^;]*?ADD COLUMN\s+"updatedAt" TIMESTAMP\(3\) NOT NULL',s,re.S)]
s=re.sub(r'(ADD COLUMN\s+"updatedAt" TIMESTAMP\(3\) NOT NULL)([,;])',r'\1 DEFAULT CURRENT_TIMESTAMP\2',s)
must('ALTER TABLE "Student" DROP COLUMN "classId",\nADD COLUMN','ALTER TABLE "Student" ADD COLUMN')
must('ADD COLUMN     "name" TEXT,\nDROP COLUMN "type",\nADD COLUMN     "type" TEXT NOT NULL;','ADD COLUMN     "name" TEXT,\nALTER COLUMN "type" TYPE TEXT USING "type"::text;')
must('-- CreateIndex\nCREATE UNIQUE INDEX "Badge_studentId_type_key" ON "Badge"("studentId", "type");\n','')
must('-- DropTable\nDROP TABLE "ConversationTopic";\n','')
datamove='''-- ═══ DATA MOVES (hand-written, SCHEMA_REPLACEMENT_PLAN S4) ═══
-- Fix 1: one Enrollment row per student that had a class
INSERT INTO "Enrollment" ("id","classId","studentId","enrolledAt","updatedAt")
SELECT 'enr_' || "id", "classId", "id", "createdAt", CURRENT_TIMESTAMP
FROM "Student" WHERE "classId" IS NOT NULL;

-- Fix 2: ConversationTopic -> SpeakingTopic, same ids so SpeakingSession.topicId stays valid
INSERT INTO "SpeakingTopic" ("id","title","prompt","topic","gradeBand","level","character","characterGender","characterRole","openingLine","mode","script","status","version","createdAt","updatedAt")
SELECT "id","title","openingLine",NULL,"gradeBand","level","character","characterGender","characterRole","openingLine","mode","script",'DRAFT',1,"createdAt","createdAt"
FROM "ConversationTopic";

-- Fix 5 (owner decision 2026-11-19): existing passages and topics stay DRAFT
-- until an SME approves them. No status update here on purpose.

'''
i=s.index('-- AddForeignKey'); s=s[:i]+datamove+s[i:]
tail='\n-- ═══ CLEANUP after data moves ═══\nALTER TABLE "Student" DROP COLUMN "classId";\nDROP TABLE "ConversationTopic";\n'
for t in alter_tables: tail+=f'ALTER TABLE "{t}" ALTER COLUMN "updatedAt" DROP DEFAULT;\n'
header='''-- WizLingo target schema migration (task 1.0, docs/plans/SCHEMA_REPLACEMENT_PLAN.md step S4)
-- Generated with `prisma migrate diff` (production HEAD schema -> target), then hand-edited
-- by scripts/make-target-migration.py:
--   1. Student.classId copied into Enrollment before the column is dropped
--   2. ConversationTopic copied into SpeakingTopic (same ids) before the table is dropped
--   3. Badge.type converted enum -> text in place (earned badges kept)
--   4. updatedAt added with a temporary default so existing rows get a value
--   5. Existing passages/topics stay DRAFT (owner decision): hidden until SME approval
-- Rehearse on a restored production backup (S6) before running in production.

'''
open(dst,'w').write(header+s.strip()+'\n'+tail)
print('updatedAt defaults on:',alter_tables)
