-- Seed conversation topics with better personalities (20 topics total)
INSERT INTO "ConversationTopic" (id, title, character, "characterGender", "characterRole", "openingLine", script, level, "gradeBand", mode, "createdAt")
SELECT 't1', 'Breakfast Chat', 'Mom', 'FEMALE'::text, 'Parent'::text, 'Good morning, sweetie! How did you sleep? Let me make you something yummy!', '"Casual family chat about breakfast, plans for the day, favorite foods"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't1')
UNION ALL
SELECT 't2', 'Pet Friend', 'Alex', 'MALE'::text, 'Friend'::text, 'Hey! You won\'t believe what happened! I got a new puppy and it\'s so adorable!', '"Fun chat about pets, animals, funny pet stories, how to care for animals"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't2')
UNION ALL
SELECT 't3', 'School Day', 'Teacher', 'FEMALE'::text, 'Teacher'::text, 'Hi there! How was your school day? Did you have fun with your friends?', '"Friendly teacher asking about school, friends, favorite subjects, and learning"'::json, 2, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't3')
UNION ALL
SELECT 't4', 'Weather Talk', 'Jamie', 'MALE'::text, 'Friend'::text, 'Hey! Have you seen this weather? It\'s so interesting! What do you think?', '"Chatting about weather, seasons, outdoor activities, and how weather affects plans"'::json, 1, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't4')
UNION ALL
SELECT 't5', 'Adventure Time', 'Explorer', 'MALE'::text, 'Mentor'::text, 'I love exploring! Would you like to plan an adventure together? Where should we go?', '"Exciting discussion about adventures, travel plans, exciting places to explore"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't5')
UNION ALL
SELECT 't6', 'Movie Night', 'Sarah', 'FEMALE'::text, 'Friend'::text, 'Oh my gosh, I just watched the coolest movie! Have you seen it?', '"Casual chat about movies, favorite characters, what makes a good story"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't6')
UNION ALL
SELECT 't7', 'Sports Buddy', 'Ravi', 'MALE'::text, 'Friend'::text, 'Are you into sports? I love playing and talking about games! What\'s your favorite?', '"Friendly sports enthusiast sharing passion about games, teamwork, and fitness"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't7')
UNION ALL
SELECT 't8', 'Hobby Passion', 'Emma', 'FEMALE'::text, 'Friend'::text, 'I\'m so excited to talk about my favorite hobby! What do you like to do for fun?', '"Enthusiastic conversation about hobbies, art, music, crafts, and interests"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't8')
UNION ALL
SELECT 't9', 'Travel Dreams', 'Marco', 'MALE'::text, 'Mentor'::text, 'I\'ve been to so many cool places! Let me tell you about my adventures. Where do YOU want to go?', '"Inspiring mentor sharing travel experiences and encouraging dream-building"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't9')
UNION ALL
SELECT 't10', 'Science Explorer', 'Professor', 'MALE'::text, 'Mentor'::text, 'Did you know that science is everywhere? What fascinates you the most?', '"Curious mentor making science fun and relatable through real-world examples"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't10')
UNION ALL
SELECT 't11', 'Food Lover', 'Chef', 'MALE'::text, 'Mentor'::text, 'Cooking is my passion! Do you like to cook? Let me share my favorite recipes!', '"Enthusiastic chef talking about food, cooking tips, and culinary adventures"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't11')
UNION ALL
SELECT 't12', 'Music Lover', 'Aisha', 'FEMALE'::text, 'Friend'::text, 'Music makes me so happy! What\'s your favorite song or artist? Let\'s talk about it!', '"Energetic friend passionate about music, sharing playlists and concert stories"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't12')
UNION ALL
SELECT 't13', 'Future Plans', 'Mentor', 'MALE'::text, 'Mentor'::text, 'I\'m curious about your dreams! What do you want to be when you grow up?', '"Supportive mentor helping students think about their future and goals"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't13')
UNION ALL
SELECT 't14', 'Technology Talk', 'Tech', 'MALE'::text, 'Friend'::text, 'Did you see the latest tech gadget? Technology is evolving so fast! What do you think?', '"Tech-savvy friend excited about innovations and how tech changes our lives"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't14')
UNION ALL
SELECT 't15', 'Book Club', 'Librarian', 'FEMALE'::text, 'Mentor'::text, 'I LOVE books! Have you read anything interesting lately? What do you think about it?', '"Enthusiastic librarian encouraging reading and discussing stories"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't15')
UNION ALL
SELECT 't16', 'Environment Buddy', 'Eco', 'FEMALE'::text, 'Friend'::text, 'Our planet is amazing! Do you care about the environment? Let\'s talk about it!', '"Passionate environmentalist discussing nature conservation and sustainability"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't16')
UNION ALL
SELECT 't17', 'Culture Explorer', 'Maya', 'FEMALE'::text, 'Mentor'::text, 'Different cultures are so interesting! Tell me about yours. I\'d love to learn!', '"Curious mentor celebrating cultural diversity and encouraging cultural exchange"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't17')
UNION ALL
SELECT 't18', 'Dream Maker', 'Coach', 'MALE'::text, 'Mentor'::text, 'Everyone has dreams! I believe in you! Tell me what you want to achieve!', '"Motivational coach believing in students and helping them set meaningful goals"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't18')
UNION ALL
SELECT 't19', 'Friendship Chat', 'Alex', 'MALE'::text, 'Friend'::text, 'You know what I love? Good friends! What does friendship mean to you?', '"Kind friend talking about the value of friendship and meaningful connections"'::json, 1, 'BAND_3_5'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't19')
UNION ALL
SELECT 't20', 'Learning Quest', 'Sage', 'MALE'::text, 'Mentor'::text, 'Learning new things is the best adventure! What are you curious about today?', '"Wise mentor inspiring continuous learning and intellectual curiosity"'::json, 2, 'BAND_6_8'::text, 'SCRIPTED'::text, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ConversationTopic" WHERE id = 't20');
