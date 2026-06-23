-- Seed conversation topics if they don't exist
INSERT INTO "ConversationTopic" (id, title, character, "characterGender", "characterRole", "openingLine", script, level, "gradeBand", mode, "createdAt")
SELECT 't1', 'Breakfast Chat', 'Mom', 'FEMALE'::text, 'Parent'::text, 'Good morning! Did you sleep well?', '"Regular conversation about breakfast and morning routine"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't1')
UNION ALL
SELECT 't2', 'Pet Friend', 'Alex', 'MALE'::text, 'Friend'::text, 'I got a new puppy! Want to see?', '"Conversation about pets and animals"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't2')
UNION ALL
SELECT 't3', 'School Day', 'Teacher', 'FEMALE'::text, 'Teacher'::text, 'How was your school day?', '"Discussion about school, classes, and friends"'::json, 2, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't3')
UNION ALL
SELECT 't4', 'Weather Talk', 'Jamie', 'MALE'::text, 'Friend'::text, 'What do you think about this weather?', '"Conversation about different weather types"'::json, 1, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't4')
UNION ALL
SELECT 't5', 'Adventure Time', 'Explorer', 'MALE'::text, 'Mentor'::text, 'Would you like to go on an adventure?', '"Planning and discussing outdoor adventures"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't5');
