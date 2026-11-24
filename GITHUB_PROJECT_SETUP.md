# GitHub Project Board Setup Guide

**Project:** WizLingo Fast-Track Beta  
**Sprint:** Week 1 - Lesson Player & Content APIs  
**Status:** Ready to Create  

---

## Quick Setup (5 minutes)

### Step 1: Create GitHub Project
1. Go to: https://github.com/your-org/reading-app/projects
2. Click "New project"
3. **Name:** `Week 1 - Lesson Player`
4. **Template:** Table
5. Click "Create"

### Step 2: Add Custom Fields
1. Click "Settings"
2. Add fields:
   - **Priority** (Single select: P0, P1, P2)
   - **Owner** (Single select: names of team members)
   - **Story Points** (Number)
   - **Status** (Select: Not Started, In Progress, In Review, Done)
   - **Blocked** (Checkbox)

### Step 3: Import Issues
Use the GitHub CLI or create manually (see below).

---

## Method 1: Manual Creation (Via Web UI)

### Create Issues One by One

Go to: https://github.com/your-org/reading-app/issues/new

#### Issue 1: T1.1 - Lesson Content API Design

```
Title: T1.1: Lesson Content API Design

Labels: 
  - backend
  - api-design
  - week-1
  - p0

Assignee: [Backend Lead]

Milestone: Week 1 - Lesson Player

Body:

## Description
Design API contracts for lesson content serving. Define request/response schemas and error handling.

## Acceptance Criteria
- [ ] API specification documented (request/response examples)
- [ ] HTTP status codes defined (200, 400, 401, 404, 500)
- [ ] Error response format standardized
- [ ] Rate limiting rules defined
- [ ] Pagination (if applicable) designed
- [ ] Caching strategy documented

## Story Points
3

## Priority
P0

## Details
See WEEK1_TASKS.md > T1.1 for full requirements

## Dependencies
None

## Files to Create/Update
- [ ] LESSON_API_SPEC.md (new file)
- [ ] docs/api/lesson-content.md (new file)

## Blocks
- T1.2: Lesson Start Endpoint
- T1.3: Lesson Submit Endpoint
- T1.4: Answer Validation Logic
```

#### Issue 2: T1.2 - Create Lesson Start Endpoint

```
Title: T1.2: Create Lesson Start Endpoint

Labels:
  - backend
  - api
  - lesson
  - week-1
  - p0

Assignee: [Backend Developer]

Milestone: Week 1 - Lesson Player

Body:

## Description
Implement POST /api/lesson/start endpoint that:
1. Validates lesson exists & is accessible to student
2. Creates LessonSession record
3. Returns lesson content with sessionId

## Story Points
5

## Priority
P0

## Implementation Checklist
- [ ] Create route file: app/api/lesson/start/route.ts
- [ ] Implement auth check (JWT token)
- [ ] Validate lessonId exists
- [ ] Check student grade compatibility
- [ ] Create LessonSession in database
- [ ] Fetch lesson content
- [ ] Return formatted response
- [ ] Error handling (404, 401, 400)
- [ ] Logging for debugging

## Acceptance Criteria
- [ ] Endpoint callable with valid token
- [ ] Returns 401 without token
- [ ] Returns 404 if lesson doesn't exist
- [ ] Creates LessonSession record
- [ ] Response includes all required fields
- [ ] Error messages are clear
- [ ] Logs all errors for debugging

## Testing
- [ ] Unit tests written
- [ ] Manual testing with curl

## Dependencies
- Blocked by: T1.1

## Related
- Unblocks: T1.5
```

---

## Method 2: Automated Creation (Via GitHub CLI)

### Install GitHub CLI
```bash
# macOS
brew install gh

# Or download from: https://cli.github.com/
```

### Create Issues Programmatically

**Create Script:** `scripts/create-week1-issues.sh`

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Helper function to create issue
create_issue() {
  local title=$1
  local assignee=$2
  local labels=$3
  local body=$4

  echo "Creating: $title..."
  
  gh issue create \
    --title "$title" \
    --assignee "$assignee" \
    --label "$labels" \
    --body "$body" \
    --milestone "Week 1 - Lesson Player"
  
  echo -e "${GREEN}✓ Created: $title${NC}\n"
}

# T1.1
create_issue \
  "T1.1: Lesson Content API Design" \
  "backend-lead" \
  "backend,api-design,week-1,p0" \
  "Design API contracts for lesson content serving.

## Acceptance Criteria
- [ ] API specification documented
- [ ] HTTP status codes defined
- [ ] Error response format standardized
- [ ] Rate limiting rules defined
- [ ] Pagination designed
- [ ] Caching strategy documented

## Story Points
3

See WEEK1_TASKS.md for full details.

**Blocks:** T1.2, T1.3, T1.4"

# T1.2
create_issue \
  "T1.2: Create Lesson Start Endpoint" \
  "backend-dev" \
  "backend,api,lesson,week-1,p0" \
  "Implement POST /api/lesson/start endpoint.

## Story Points
5

## Key Tasks
- [ ] Create app/api/lesson/start/route.ts
- [ ] Implement auth check
- [ ] Validate lessonId
- [ ] Create LessonSession record
- [ ] Return lesson content

**Depends on:** T1.1
**Blocks:** T1.5"

# T1.3
create_issue \
  "T1.3: Create Lesson Submit Endpoint" \
  "backend-dev" \
  "backend,api,lesson,week-1,p0" \
  "Implement POST /api/lesson/:sessionId/submit endpoint.

## Story Points
5

## Key Tasks
- [ ] Create app/api/lesson/[sessionId]/submit/route.ts
- [ ] Validate session ownership
- [ ] Calculate score
- [ ] Award XP to student
- [ ] Save responses to database

**Depends on:** T1.2"

# T1.4
create_issue \
  "T1.4: Create Answer Validation Logic" \
  "backend-dev" \
  "backend,validation,week-1,p0" \
  "Create reusable answer validation library.

## Story Points
5

## Key Tasks
- [ ] Create lib/assessment/validator.ts
- [ ] Implement multiple choice validation
- [ ] Implement true/false validation
- [ ] Unit tests for each validator

**Depends on:** T1.1"

# T1.5
create_issue \
  "T1.5: Create Lesson Player Component" \
  "frontend-dev" \
  "frontend,ui,lesson,week-1,p0" \
  "Build interactive lesson player component.

## Story Points
8

## Key Tasks
- [ ] Create app/lesson/[sessionId]/page.tsx
- [ ] Add auth check
- [ ] Fetch lesson content on mount
- [ ] Implement content display
- [ ] Handle answer selection
- [ ] Show progress indicator
- [ ] Responsive design

**Depends on:** T1.2"

# T1.6
create_issue \
  "T1.6: Create Results/Feedback Screen" \
  "frontend-dev" \
  "frontend,ui,results,week-1,p0" \
  "Build results screen showing score and feedback.

## Story Points
5

## Key Tasks
- [ ] Create app/lesson/[sessionId]/results/page.tsx
- [ ] Display score and percentage
- [ ] Show XP earned
- [ ] Display pass/fail status
- [ ] Retry button if failed

**Depends on:** T1.5, T1.3"

# T1.7
create_issue \
  "T1.7: Integration Testing" \
  "qa-engineer" \
  "testing,qa,week-1,p0" \
  "Test complete lesson flow from start to results.

## Story Points
5

## Test Cases
- [ ] Happy path (all correct)
- [ ] Partial correct
- [ ] All wrong
- [ ] Auth validation
- [ ] Error handling

**Depends on:** T1.2, T1.3, T1.5, T1.6"

# T1.8
create_issue \
  "T1.8: Deploy to Staging" \
  "devops-engineer" \
  "devops,deployment,week-1,p1" \
  "Deploy Week 1 code to staging environment.

## Story Points
3

## Checklist
- [ ] Code review approved
- [ ] Tests passing
- [ ] Merge to develop
- [ ] Build successful
- [ ] Migrations run
- [ ] Health check passing

**Depends on:** T1.7"

echo -e "${GREEN}All Week 1 issues created!${NC}"
```

### Run Script
```bash
chmod +x scripts/create-week1-issues.sh
./scripts/create-week1-issues.sh
```

---

## GitHub Project Board Layout

### View 1: Table View (Default)
```
| Title                    | Owner        | Priority | Points | Status      | Blocked |
|--------------------------|--------------|----------|--------|-------------|---------|
| T1.1: API Design         | Backend Lead | P0       | 3      | Not Started | □       |
| T1.2: Start Endpoint     | Backend Dev  | P0       | 5      | Not Started | □       |
| T1.3: Submit Endpoint    | Backend Dev  | P0       | 5      | Not Started | □       |
| T1.4: Validation Logic   | Backend Dev  | P0       | 5      | Not Started | □       |
| T1.5: Lesson Player      | Frontend Dev | P0       | 8      | Not Started | □       |
| T1.6: Results Screen     | Frontend Dev | P0       | 5      | Not Started | □       |
| T1.7: Testing            | QA Engineer  | P0       | 5      | Not Started | □       |
| T1.8: Deploy Staging     | DevOps Eng   | P1       | 3      | Not Started | □       |
```

### View 2: Board View (Kanban)
```
Not Started          In Progress          Review               Done
├─ T1.1              ├─ T1.2              ├─ T1.5             ├─ (empty)
├─ T1.3              ├─ T1.4              └─ T1.6
├─ T1.7              └─ (empty)           
└─ T1.8
```

### View 3: Roadmap View
```
Week 1 - Lesson Player
├─ Phase 1: APIs (T1.1, T1.2, T1.3, T1.4)
├─ Phase 2: Frontend (T1.5, T1.6)
├─ Phase 3: Testing (T1.7)
└─ Phase 4: Deployment (T1.8)
```

---

## Labels to Create

```
Backend
├─ backend
├─ api
├─ api-design
├─ validation

Frontend
├─ frontend
├─ ui
├─ lesson
├─ results

Testing
├─ testing
├─ qa
├─ integration-test

DevOps
├─ devops
├─ deployment

Priority
├─ p0
├─ p1
├─ p2

Other
├─ week-1
├─ bug
├─ documentation
```

---

## Team Member Assignment

Create these in GitHub or note them down:

| Team Member | GitHub Handle | Role | Capacity |
|-------------|---------------|------|----------|
| [Name] | @handle | Backend Lead | 100% |
| [Name] | @handle | Backend Dev | 100% |
| [Name] | @handle | Frontend Dev | 100% |
| [Name] | @handle | QA Engineer | 50% |
| [Name] | @handle | DevOps Engineer | 50% |

---

## Automation & Rules

### Auto-Status Updates
Set up workflows to auto-update status when:
- PR opened → Move to "In Progress"
- PR review requested → Move to "Review"
- PR merged → Move to "Done"

### Auto-Close Issues
Close related issues when PR is merged.

### Auto-Assign Reviewers
Assign reviewers based on labels (backend issues → backend reviewers).

---

## Daily Standup Integration

### Link Board to Slack
1. Go to Project Settings
2. Add Slack workspace
3. Post daily summary to channel

**Message Template:**
```
🚀 Week 1 - Lesson Player Update

✅ Completed Today: [# issues]
🔄 In Progress: [# issues]
⏸️ Blocked: [# issues]

📊 Progress: [X of 8 tasks done]
📈 Velocity: [story points completed]

🔗 View: [Project Link]
```

---

## Burndown Chart Tracking

### Manual Tracking (Spreadsheet)
```
| Day | Completed | In Progress | Not Started | Total Points | Points Left |
|-----|-----------|-------------|-------------|--------------|-------------|
| Mon | 0         | 2           | 6           | 39           | 39          |
| Tue | 3         | 3           | 2           | 39           | 23          |
| Wed | 6         | 1           | 1           | 39           | 15          |
| Thu | 8         | 0           | 0           | 39           | 0           |
```

### GitHub Actions (Automatic)
Create `.github/workflows/burndown.yml`:
```yaml
name: Update Burndown
on:
  schedule:
    - cron: '0 17 * * *'  # Daily at 5 PM
  issue_comment:
    types: [created, edited]

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Update burndown chart
        run: |
          # Query issues and calculate metrics
          # Post to spreadsheet or dashboard
```

---

## Definition of Done (DoD)

Before marking task as Done:

**Code Requirements:**
- [ ] Code written per spec
- [ ] All acceptance criteria met
- [ ] Unit tests written & passing
- [ ] Code reviewed & approved
- [ ] Merged to develop branch
- [ ] No new linting errors
- [ ] Documentation updated

**QA Requirements:**
- [ ] Manual testing complete
- [ ] All test cases passing
- [ ] No regressions
- [ ] Screenshots/video added to PR

**DevOps Requirements:**
- [ ] Deployed to staging
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Rollback plan ready

---

## Quick Reference Commands

### CLI Commands
```bash
# View all issues for Week 1
gh issue list --label week-1 --state open

# Create issue
gh issue create --title "..." --label "..." --assignee "..."

# Update issue status
gh issue edit <issue-number> --add-label "in-progress"

# View project
gh project view <project-number>

# List all PRs
gh pr list --label week-1
```

---

## Success Criteria

By end of Week 1:
- [ ] All 8 issues created in GitHub
- [ ] All issues assigned to team members
- [ ] Project board set up with views
- [ ] Daily standups scheduled
- [ ] Burndown tracking started
- [ ] First PR created for T1.1
- [ ] Team trained on workflow

---

## Next Steps After Setup

1. **Review Board Together** (15 min)
   - Share board with team
   - Explain workflow
   - Answer questions

2. **Start Daily Standups** (15 min)
   - Set time: 9 AM daily
   - Format: What's done, what's next, blockers
   - Update board after standup

3. **Kick Off T1.1** (30 min)
   - Backend lead starts API design
   - Share design doc when ready
   - Code review when PR opened

4. **Monitor Progress**
   - Update board daily
   - Track burndown
   - Celebrate wins 🎉

---

## Resources

- GitHub Projects: https://docs.github.com/en/issues/planning-and-tracking-with-projects
- GitHub CLI: https://cli.github.com/
- GitHub Automation: https://docs.github.com/en/actions

---

**Setup Time:** ~30 minutes (including team training)  
**Board Status:** Ready to Create  
**Next:** Execute setup steps above
