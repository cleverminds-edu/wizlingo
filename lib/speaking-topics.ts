export type GradeBandKey = "BAND_1_2" | "BAND_3_5" | "BAND_6_8" | "BAND_9_10";

export interface ScriptTurn {
  aiText: string;
  hint: string;
  timeSec: number;
}

export interface TopicScript {
  turns: ScriptTurn[];
}

export interface TopicSeed {
  title: string;
  gradeBand: GradeBandKey;
  level: number;
  character: string;
  openingLine: string;
  script: TopicScript;
}

export const CHARACTER_INFO: Record<string, { emoji: string; from: string; tagline: string }> = {
  Meera: { emoji: "👧", from: "Mumbai", tagline: "Loves drawing and telling stories" },
  Arjun: { emoji: "👦", from: "Delhi",  tagline: "Cricket fanatic and travel lover" },
  Priya: { emoji: "🧒", from: "Bangalore", tagline: "Science geek and book worm" },
  Rohan: { emoji: "🧑", from: "Chennai", tagline: "Curious about technology and big ideas" },
};

export const SPEAKING_TOPICS: TopicSeed[] = [

  // ── BAND_1_2  Level 1 ─────────────────────────────────────────────────────
  {
    title: "My Family",
    gradeBand: "BAND_1_2",
    level: 1,
    character: "Meera",
    openingLine: "Hi! I'm Meera. Tell me about your family!",
    script: {
      turns: [
        { aiText: "How many people are there in your family?", hint: "Say how many — like 4 or 5 people", timeSec: 20 },
        { aiText: "Who do you like spending time with the most at home?", hint: "Name one person and why you like them", timeSec: 20 },
        { aiText: "Does your family do something special together?", hint: "Maybe eating together, watching TV, or going to the park", timeSec: 20 },
        { aiText: "What is one nice thing your family does for you?", hint: "Think about something they cook, buy, or do with you", timeSec: 20 },
      ],
    },
  },
  {
    title: "My Pet or Favourite Animal",
    gradeBand: "BAND_1_2",
    level: 1,
    character: "Meera",
    openingLine: "Hi! I love animals! Do you have a pet at home?",
    script: {
      turns: [
        { aiText: "What animal do you like the most? Do you have one at home?", hint: "Name the animal — cat, dog, fish, or any other", timeSec: 20 },
        { aiText: "What colour is it? What does it look like?", hint: "Describe its colour, size, or fur", timeSec: 20 },
        { aiText: "What does your pet or favourite animal eat?", hint: "Say what food it likes", timeSec: 20 },
        { aiText: "What is the funniest or cutest thing it does?", hint: "Share something funny or sweet about the animal", timeSec: 20 },
      ],
    },
  },
  {
    title: "My Favourite Food",
    gradeBand: "BAND_1_2",
    level: 1,
    character: "Meera",
    openingLine: "Hi! I love eating yummy food. What is your favourite food?",
    script: {
      turns: [
        { aiText: "What is your most favourite food in the whole world?", hint: "Name the dish — could be idli, pizza, biryani, paratha…", timeSec: 20 },
        { aiText: "Who makes it for you? Do you know how it is cooked?", hint: "Say who cooks it — mummy, dadi, or the cook", timeSec: 20 },
        { aiText: "When do you usually eat it — for breakfast, lunch, or dinner?", hint: "Say the meal time and why you like it then", timeSec: 20 },
        { aiText: "If you could eat only one food for a whole week, what would it be?", hint: "Pick your favourite and say why", timeSec: 20 },
      ],
    },
  },

  // ── BAND_1_2  Level 2 ─────────────────────────────────────────────────────
  {
    title: "My School Day",
    gradeBand: "BAND_1_2",
    level: 2,
    character: "Meera",
    openingLine: "Hey! I want to know everything about your school day. Let's chat!",
    script: {
      turns: [
        { aiText: "What time do you wake up on a school day and what do you do first?", hint: "Tell the time and your morning routine", timeSec: 25 },
        { aiText: "Which subject do you enjoy the most and why?", hint: "Name the subject and give one reason you like it", timeSec: 25 },
        { aiText: "What do you usually eat for lunch at school?", hint: "Describe what is in your tiffin box", timeSec: 25 },
        { aiText: "Who is your favourite teacher and what do they teach?", hint: "Name the teacher and the subject", timeSec: 25 },
        { aiText: "What do you do as soon as you reach home after school?", hint: "Describe your after-school routine", timeSec: 25 },
      ],
    },
  },
  {
    title: "My Best Friend",
    gradeBand: "BAND_1_2",
    level: 2,
    character: "Meera",
    openingLine: "I love making new friends! Tell me about your best friend.",
    script: {
      turns: [
        { aiText: "What is your best friend's name and which class are they in?", hint: "Say the name and the class", timeSec: 25 },
        { aiText: "How did you two become friends? Where did you first meet?", hint: "Tell the story of how you met", timeSec: 25 },
        { aiText: "What games do you both like to play together?", hint: "Name one or two games you enjoy", timeSec: 25 },
        { aiText: "Have you ever had a fight with your best friend? What happened?", hint: "Tell a short story — it's okay if it was small!", timeSec: 25 },
        { aiText: "What is the best thing about your best friend?", hint: "Say one or two nice things about them", timeSec: 25 },
      ],
    },
  },
  {
    title: "Colours and Art",
    gradeBand: "BAND_1_2",
    level: 2,
    character: "Meera",
    openingLine: "I love drawing and colours! Do you like art? Let's talk about it!",
    script: {
      turns: [
        { aiText: "What is your absolute favourite colour? Why do you love it?", hint: "Name the colour and one reason you like it", timeSec: 25 },
        { aiText: "Have you ever drawn a picture you were really proud of? What was it?", hint: "Describe the picture you drew", timeSec: 25 },
        { aiText: "What colours do you see the most outside when you look at nature?", hint: "Think about the sky, trees, flowers, soil", timeSec: 25 },
        { aiText: "If you could paint your bedroom any colour, what would you choose?", hint: "Pick a colour and say why you like it for a bedroom", timeSec: 25 },
        { aiText: "What is your favourite thing to draw or make with your hands?", hint: "Could be drawings, clay, paper craft, or anything", timeSec: 25 },
      ],
    },
  },

  // ── BAND_1_2  Level 3 ─────────────────────────────────────────────────────
  {
    title: "Diwali Festival",
    gradeBand: "BAND_1_2",
    level: 3,
    character: "Meera",
    openingLine: "I love Diwali so much! How do you celebrate it at your home?",
    script: {
      turns: [
        { aiText: "How does your family decorate the house for Diwali?", hint: "Talk about lights, diyas, rangoli, or flowers", timeSec: 30 },
        { aiText: "What sweets or snacks do you eat during Diwali?", hint: "Name your favourites — ladoo, barfi, chakli…", timeSec: 30 },
        { aiText: "Do you burst crackers or watch fireworks? What is your favourite?", hint: "Describe the type and why you like it", timeSec: 30 },
        { aiText: "Do you visit relatives or do relatives come to your home?", hint: "Tell who visits and what you do together", timeSec: 30 },
        { aiText: "What is the most exciting moment of Diwali for you?", hint: "Pick one special moment and describe it", timeSec: 30 },
        { aiText: "Do you know why we celebrate Diwali? What have you been told about it?", hint: "Share the story — the return of Lord Rama or another", timeSec: 30 },
      ],
    },
  },
  {
    title: "My Favourite Game",
    gradeBand: "BAND_1_2",
    level: 3,
    character: "Meera",
    openingLine: "Playtime is the best time! What games do you love to play?",
    script: {
      turns: [
        { aiText: "What is your all-time favourite game to play?", hint: "Name the game — cricket, carrom, ludo, video game…", timeSec: 30 },
        { aiText: "Do you play it inside or outside? Where do you usually play?", hint: "Describe the place where you play", timeSec: 30 },
        { aiText: "Who do you play it with? Friends, siblings, or parents?", hint: "Name the people you play with and how many there are", timeSec: 30 },
        { aiText: "What is the most exciting part of the game?", hint: "Describe the best moment — scoring, winning, a cool move", timeSec: 30 },
        { aiText: "Have you ever won something or been really good at a game?", hint: "Share a time you played really well", timeSec: 30 },
        { aiText: "Would you like to learn a new game? Which one and why?", hint: "Name a game you've seen others play that you want to try", timeSec: 30 },
      ],
    },
  },
  {
    title: "The Monsoon Season",
    gradeBand: "BAND_1_2",
    level: 3,
    character: "Meera",
    openingLine: "I love the rainy season! Do you like the rain? Let's talk about it!",
    script: {
      turns: [
        { aiText: "How do you feel when it starts raining heavily outside?", hint: "Say if you feel happy, excited, scared — and why", timeSec: 30 },
        { aiText: "What do you do at home when it rains and you cannot go out?", hint: "Describe your indoor rainy day activities", timeSec: 30 },
        { aiText: "Have you ever played in the rain or jumped in puddles?", hint: "Tell a fun rainy day story", timeSec: 30 },
        { aiText: "What happens to the plants and trees after it rains?", hint: "Look around and describe what you notice after rain", timeSec: 30 },
        { aiText: "What food do you like to eat on a rainy day?", hint: "Pakoras, chai, maggi, hot soup — pick your favourite", timeSec: 30 },
        { aiText: "Do you think rain is good or bad? Why?", hint: "Give one reason why rain helps us — think about farmers and water", timeSec: 30 },
      ],
    },
  },

  // ── BAND_3_5  Level 1 ─────────────────────────────────────────────────────
  {
    title: "Summer Holidays",
    gradeBand: "BAND_3_5",
    level: 1,
    character: "Arjun",
    openingLine: "Hey! Summer holidays are the best! What did you do in your last holiday?",
    script: {
      turns: [
        { aiText: "Where did you go or what did you do during your last summer holiday?", hint: "Describe the main thing — visit, trip, activity at home", timeSec: 30 },
        { aiText: "Did you visit any new place? What was interesting about it?", hint: "Name the place and one thing you remember", timeSec: 30 },
        { aiText: "What outdoor activity did you enjoy the most in the holidays?", hint: "Swimming, cricket, cycling, visiting a park — what was it?", timeSec: 30 },
        { aiText: "Did you read any book or watch any show you really liked?", hint: "Name the book or show and say what you enjoyed about it", timeSec: 30 },
        { aiText: "What was the one thing you missed about school when you were on holiday?", hint: "Could be friends, sports, mid-day meal, or a subject", timeSec: 30 },
      ],
    },
  },
  {
    title: "My Favourite Sport",
    gradeBand: "BAND_3_5",
    level: 1,
    character: "Arjun",
    openingLine: "You know me — I'm crazy about cricket! What sport do you love?",
    script: {
      turns: [
        { aiText: "Which sport is your absolute favourite and why?", hint: "Name the sport and give two reasons you love it", timeSec: 30 },
        { aiText: "Do you play it yourself or mostly watch it?", hint: "Say if you play, watch both, or only one — and where", timeSec: 30 },
        { aiText: "Who is your favourite sportsperson? What do you admire about them?", hint: "Name the player and one quality you respect", timeSec: 30 },
        { aiText: "Have you ever seen a live match or competition? How was it?", hint: "Tell about the experience — was it exciting? Describe the crowd", timeSec: 30 },
        { aiText: "Do you think sports are important for students? Why?", hint: "Give a reason — fitness, teamwork, or fun", timeSec: 30 },
      ],
    },
  },
  {
    title: "Indian Festivals",
    gradeBand: "BAND_3_5",
    level: 1,
    character: "Arjun",
    openingLine: "India has so many colourful festivals! Which one do you love the most?",
    script: {
      turns: [
        { aiText: "What is your favourite Indian festival and why do you enjoy it so much?", hint: "Name the festival and give two reasons", timeSec: 30 },
        { aiText: "How does your family prepare for this festival days before it arrives?", hint: "Talk about cleaning, cooking, buying new things, or decorating", timeSec: 30 },
        { aiText: "What special food is made at home during this festival?", hint: "Name the dishes and say who makes them", timeSec: 30 },
        { aiText: "Do you exchange gifts or visit anyone during the festival?", hint: "Describe what you give, get, or who you visit", timeSec: 30 },
        { aiText: "What is the story or reason behind this festival? Do you know it?", hint: "Share the legend or historical reason", timeSec: 30 },
      ],
    },
  },

  // ── BAND_3_5  Level 2 ─────────────────────────────────────────────────────
  {
    title: "A Book I Recently Read",
    gradeBand: "BAND_3_5",
    level: 2,
    character: "Arjun",
    openingLine: "I just finished a book about cricket legends! Have you read anything good lately?",
    script: {
      turns: [
        { aiText: "Tell me about the last book you read. What was it about?", hint: "Give the title and a one-line summary", timeSec: 35 },
        { aiText: "Who was the main character and what kind of person were they?", hint: "Describe the character's personality and what they did", timeSec: 35 },
        { aiText: "What was the most exciting or surprising moment in the book?", hint: "Describe that scene in detail", timeSec: 35 },
        { aiText: "What did you learn from this book — about life or about the world?", hint: "Share the message or lesson you took away", timeSec: 35 },
        { aiText: "Would you recommend this book to a friend? What would you say to convince them?", hint: "Sell the book — give two strong reasons to read it", timeSec: 35 },
        { aiText: "What kind of book do you want to read next? Why?", hint: "Name the genre or topic and give your reason", timeSec: 35 },
      ],
    },
  },
  {
    title: "A Place I Want to Visit",
    gradeBand: "BAND_3_5",
    level: 2,
    character: "Arjun",
    openingLine: "I dream of visiting the Himalayas one day! Where do you want to go?",
    script: {
      turns: [
        { aiText: "If you could travel anywhere in India or the world, where would you go first?", hint: "Name the place and say why it draws you", timeSec: 35 },
        { aiText: "What do you already know about this place? Have you read or heard anything about it?", hint: "Share facts, stories, or things you've seen in pictures or TV", timeSec: 35 },
        { aiText: "What would you most like to do or see there?", hint: "Name the activity, monument, food, or experience you're excited about", timeSec: 35 },
        { aiText: "Who would you like to take with you and why?", hint: "Name the people and give a reason for each", timeSec: 35 },
        { aiText: "What problems might you face while travelling there? How would you handle them?", hint: "Think about language, food, climate, distance", timeSec: 35 },
        { aiText: "How would you feel standing there in real life? What would you do first?", hint: "Describe your emotions and your first action", timeSec: 35 },
      ],
    },
  },
  {
    title: "Wildlife in India",
    gradeBand: "BAND_3_5",
    level: 2,
    character: "Arjun",
    openingLine: "Did you know India has tigers, elephants and snow leopards? What's your favourite wild animal?",
    script: {
      turns: [
        { aiText: "Which wild animal in India fascinates you the most and why?", hint: "Name the animal and two reasons you find it amazing", timeSec: 35 },
        { aiText: "Where does this animal live in India? What is its habitat like?", hint: "Describe the forest, mountain, river, or desert it lives in", timeSec: 35 },
        { aiText: "Is this animal endangered? Why are some animals disappearing?", hint: "Talk about poaching, forest loss, or climate — what you know", timeSec: 35 },
        { aiText: "Have you ever seen this animal — in a zoo, sanctuary, or the wild?", hint: "Share the experience or what you imagine seeing it would be like", timeSec: 35 },
        { aiText: "What can students your age do to help protect wild animals?", hint: "Give one or two practical ideas", timeSec: 35 },
        { aiText: "Why do you think it's important to protect animals even if they are not useful to humans?", hint: "Think about the food chain, nature, and balance of life", timeSec: 35 },
      ],
    },
  },

  // ── BAND_3_5  Level 3 ─────────────────────────────────────────────────────
  {
    title: "Nature and Environment",
    gradeBand: "BAND_3_5",
    level: 3,
    character: "Arjun",
    openingLine: "I've been reading about climate change — it's scary stuff! How aware are you about nature?",
    script: {
      turns: [
        { aiText: "What changes in nature have you noticed around you over the last few years?", hint: "Think about weather, rivers, forests, air quality in your area", timeSec: 40 },
        { aiText: "What do you think is the biggest threat to our environment today?", hint: "Pollution, deforestation, plastic waste — pick one and explain", timeSec: 40 },
        { aiText: "How does what happens to nature affect ordinary people in India?", hint: "Think about farmers, floods, droughts, or air quality", timeSec: 40 },
        { aiText: "What is one thing you personally do to help the environment?", hint: "Maybe saving water, not wasting food, avoiding plastic", timeSec: 40 },
        { aiText: "If you became Prime Minister for a day, what would you do to protect nature?", hint: "Give one big policy idea and explain it", timeSec: 40 },
        { aiText: "How can students convince adults at home to be more eco-friendly?", hint: "Give a practical idea that a student could actually try", timeSec: 40 },
        { aiText: "What gives you hope when you think about the future of our planet?", hint: "Talk about something positive — technology, people's actions, or awareness", timeSec: 40 },
      ],
    },
  },
  {
    title: "A Famous Indian I Admire",
    gradeBand: "BAND_3_5",
    level: 3,
    character: "Arjun",
    openingLine: "I've been reading about Dr APJ Abdul Kalam lately. Which famous Indian inspires you?",
    script: {
      turns: [
        { aiText: "Which famous Indian person do you most admire and why did you choose them?", hint: "Name the person and one main reason you look up to them", timeSec: 40 },
        { aiText: "Tell me about their life — where were they from and what challenges did they face?", hint: "Share their background — humble beginning, difficulties they overcame", timeSec: 40 },
        { aiText: "What is their most important achievement or contribution to India?", hint: "Describe the one thing they are most remembered for", timeSec: 40 },
        { aiText: "How did this person's work change the lives of ordinary Indians?", hint: "Give a specific example of the impact they had", timeSec: 40 },
        { aiText: "What lesson from this person's life do you want to apply in your own?", hint: "Pick one quality — determination, humility, creativity — and say how", timeSec: 40 },
        { aiText: "If you could ask this person one question, what would it be?", hint: "Think about what you are most curious to know from them", timeSec: 40 },
        { aiText: "What would India be like today if this person had never existed?", hint: "Imagine the absence of their contribution and describe the difference", timeSec: 40 },
      ],
    },
  },
  {
    title: "Science in Daily Life",
    gradeBand: "BAND_3_5",
    level: 3,
    character: "Arjun",
    openingLine: "Science is not just in textbooks — it's everywhere! Where do you see science around you?",
    script: {
      turns: [
        { aiText: "Give me three examples of science you use or see in your everyday life.", hint: "Could be cooking, weather, mobile phones, medicines — anything", timeSec: 40 },
        { aiText: "How does cooking involve science? Think about what happens when food is heated.", hint: "Talk about chemical changes, boiling, evaporation, or fermentation", timeSec: 40 },
        { aiText: "Which scientific invention do you think has most changed life in India?", hint: "Electricity, internet, vaccines, railways — pick one and explain", timeSec: 40 },
        { aiText: "What science topic in school do you find most interesting and why?", hint: "Plants, space, human body, electricity, atoms — pick one", timeSec: 40 },
        { aiText: "If you could invent something to solve a problem in your city or village, what would it be?", hint: "Describe the problem and your invention idea", timeSec: 40 },
        { aiText: "Why is it important for every person in India to have basic science knowledge?", hint: "Think about health, farming, environment, or decision making", timeSec: 40 },
        { aiText: "Who is a scientist — Indian or international — that you find inspiring and why?", hint: "Name the scientist and one amazing thing they discovered or did", timeSec: 40 },
      ],
    },
  },

  // ── BAND_6_8  Level 1 ─────────────────────────────────────────────────────
  {
    title: "My Favourite Subject",
    gradeBand: "BAND_6_8",
    level: 1,
    character: "Priya",
    openingLine: "I absolutely love Biology — the human body is so fascinating! What subject excites you?",
    script: {
      turns: [
        { aiText: "Which subject are you most passionate about and what draws you to it?", hint: "Name the subject and explain what specifically excites you about it", timeSec: 35 },
        { aiText: "Tell me about the most interesting thing you've learned in this subject recently.", hint: "Explain the concept or fact and why it amazed you", timeSec: 35 },
        { aiText: "How does this subject connect to the real world outside the classroom?", hint: "Give a specific example of how it is used in daily life or careers", timeSec: 35 },
        { aiText: "What is one topic in this subject that you find challenging? How do you deal with it?", hint: "Name the difficult topic and describe your strategy to tackle it", timeSec: 35 },
        { aiText: "How has learning this subject changed the way you think or look at the world?", hint: "Give a concrete example of a shift in your thinking", timeSec: 35 },
      ],
    },
  },
  {
    title: "Technology in School",
    gradeBand: "BAND_6_8",
    level: 1,
    character: "Priya",
    openingLine: "I use my tablet every day for studying! How does technology help you in school?",
    script: {
      turns: [
        { aiText: "How do you use technology for learning — computers, tablets, the internet, apps?", hint: "Give specific examples of tools or platforms you use", timeSec: 35 },
        { aiText: "What is one thing technology has made much easier for students that was harder before?", hint: "Think about research, communication, practice tests, or note-taking", timeSec: 35 },
        { aiText: "Are there downsides to using technology for studying? What problems can it cause?", hint: "Think about distraction, eye strain, or becoming too dependent", timeSec: 35 },
        { aiText: "Do you think all students in India have equal access to technology? Why does it matter?", hint: "Consider students in villages, government schools, or low-income families", timeSec: 35 },
        { aiText: "What technology would you most like your school to have and how would it help?", hint: "Be specific — describe the tool and its benefit for learning", timeSec: 35 },
      ],
    },
  },
  {
    title: "India's Heritage and Monuments",
    gradeBand: "BAND_6_8",
    level: 1,
    character: "Priya",
    openingLine: "I visited the Taj Mahal last year — it was breathtaking! Have you visited any historical site?",
    script: {
      turns: [
        { aiText: "Have you visited any historical monument or heritage site in India? Tell me about it.", hint: "Describe the place, when you went, and what you saw", timeSec: 35 },
        { aiText: "Which monument or historical site in India do you most want to visit and why?", hint: "Name the site and explain what draws you to it", timeSec: 35 },
        { aiText: "What does the architecture or art of ancient India tell us about the people who built it?", hint: "Think about their skills, beliefs, lifestyle, or resources", timeSec: 35 },
        { aiText: "Why is it important to preserve old monuments even though it costs a lot of money?", hint: "Think about history, culture, tourism, national pride, and identity", timeSec: 35 },
        { aiText: "How can young people take responsibility for protecting India's heritage?", hint: "Give practical actions students or citizens can take", timeSec: 35 },
      ],
    },
  },

  // ── BAND_6_8  Level 2 ─────────────────────────────────────────────────────
  {
    title: "Cricket and Indian Sports",
    gradeBand: "BAND_6_8",
    level: 2,
    character: "Priya",
    openingLine: "India's recent victories in international cricket have been incredible! What do you think about Indian sports?",
    script: {
      turns: [
        { aiText: "Why do you think cricket is so much more popular than other sports in India?", hint: "Think about history, media coverage, IPL, or national identity", timeSec: 40 },
        { aiText: "India has produced great athletes in many other sports too — who stands out for you?", hint: "Name an athlete outside cricket and explain their achievement", timeSec: 40 },
        { aiText: "What role does sport play in bringing people of different backgrounds together?", hint: "Think about national team, regional diversity, or social impact", timeSec: 40 },
        { aiText: "What changes would you like to see to make India a stronger sporting nation overall?", hint: "Suggest reforms in school sports, facilities, or athlete support", timeSec: 40 },
        { aiText: "How does following sport teach students life skills outside the game?", hint: "Think about teamwork, discipline, failure, focus — give examples", timeSec: 40 },
        { aiText: "Do you think girl athletes in India get equal opportunities and recognition? What should change?", hint: "Cite examples and suggest what parents, schools, or government can do", timeSec: 40 },
      ],
    },
  },
  {
    title: "Climate Change and Our Lives",
    gradeBand: "BAND_6_8",
    level: 2,
    character: "Priya",
    openingLine: "I've been studying climate change in science class — it's so alarming! What do you think about it?",
    script: {
      turns: [
        { aiText: "How has climate change already started affecting daily life in India?", hint: "Talk about irregular monsoons, extreme heat, floods, or droughts", timeSec: 40 },
        { aiText: "Which communities in India are hit hardest by climate change and why?", hint: "Think about coastal fishermen, farmers, people in flood zones", timeSec: 40 },
        { aiText: "What are the main human activities causing climate change?", hint: "Discuss fossil fuels, deforestation, factories, or agriculture", timeSec: 40 },
        { aiText: "India is a developing country — is it fair to expect India to reduce emissions as fast as rich countries?", hint: "Think about historical responsibility, fairness, and development needs", timeSec: 40 },
        { aiText: "What renewable energy solutions are already being used in India?", hint: "Solar farms, wind energy, hydropower — share what you know", timeSec: 40 },
        { aiText: "How can individual students make a meaningful difference to climate change?", hint: "Think beyond turning off lights — what habits truly matter at scale?", timeSec: 40 },
      ],
    },
  },
  {
    title: "Social Media and Youth",
    gradeBand: "BAND_6_8",
    level: 2,
    character: "Priya",
    openingLine: "I use social media but I'm very careful about it. What's your relationship with it?",
    script: {
      turns: [
        { aiText: "How much time do you spend on social media daily and what do you mainly use it for?", hint: "Be honest — give the time and the main activities", timeSec: 40 },
        { aiText: "What are the genuine benefits of social media for students your age?", hint: "Think about learning, connecting with friends, awareness, creativity", timeSec: 40 },
        { aiText: "What are the serious risks or harms that social media can cause for teenagers?", hint: "Consider addiction, cyberbullying, fake news, body image, privacy", timeSec: 40 },
        { aiText: "Have you ever seen or experienced something online that made you uncomfortable?", hint: "You don't have to share personal details — describe the type of content", timeSec: 40 },
        { aiText: "How can young people use social media in a responsible and healthy way?", hint: "Give practical tips — time limits, verified sources, privacy settings", timeSec: 40 },
        { aiText: "Should schools teach digital literacy? What should it include?", hint: "Suggest topics — fake news, privacy, screen time, cyberbullying", timeSec: 40 },
      ],
    },
  },

  // ── BAND_6_8  Level 3 ─────────────────────────────────────────────────────
  {
    title: "My Career Dreams",
    gradeBand: "BAND_6_8",
    level: 3,
    character: "Priya",
    openingLine: "I want to be a researcher who works on vaccines! Dreams are so powerful. What do you see for yourself?",
    script: {
      turns: [
        { aiText: "What career are you currently thinking about and what first sparked that interest?", hint: "Name the field and trace it back to a specific moment or person", timeSec: 45 },
        { aiText: "What skills do you already have that will help you in this career?", hint: "Be specific — academic strengths, hobbies, personal qualities", timeSec: 45 },
        { aiText: "What skills or knowledge do you still need to develop?", hint: "Name the gaps honestly and mention how you plan to address them", timeSec: 45 },
        { aiText: "What challenges might stop people from your background from reaching this career?", hint: "Think about access to education, money, gender barriers, or location", timeSec: 45 },
        { aiText: "Is this career choice driven more by passion or by earning potential?", hint: "Be honest about the mix of both and why you feel the way you do", timeSec: 45 },
        { aiText: "How will this career contribute to society or to India's development?", hint: "Connect your personal goal to a larger purpose", timeSec: 45 },
        { aiText: "What is your Plan B if Plan A doesn't work out?", hint: "Name an alternative and explain why it is a meaningful backup", timeSec: 45 },
      ],
    },
  },
  {
    title: "Inspiring Women of India",
    gradeBand: "BAND_6_8",
    level: 3,
    character: "Priya",
    openingLine: "I look up to Kalpana Chawla so much! Which woman in Indian history or today inspires you most?",
    script: {
      turns: [
        { aiText: "Which woman — historical or contemporary — do you find most inspiring and why?", hint: "Name her, give her field, and your main reason for admiring her", timeSec: 45 },
        { aiText: "What obstacles did she face because of her gender, background, or time period?", hint: "Be specific about the barriers — social, economic, or political", timeSec: 45 },
        { aiText: "How did she overcome those obstacles? What can we learn from her strategy?", hint: "Describe her approach — education, courage, support system, persistence", timeSec: 45 },
        { aiText: "How has her work changed opportunities for women in India?", hint: "Give a concrete example of the impact she had on other women's lives", timeSec: 45 },
        { aiText: "Do you think gender equality has improved significantly in India today?", hint: "Give one area of progress and one area that still needs work", timeSec: 45 },
        { aiText: "What more needs to be done so that every girl in India can reach her full potential?", hint: "Name specific changes needed in families, schools, laws, or culture", timeSec: 45 },
        { aiText: "How do you personally plan to contribute to a more equal society?", hint: "Think of something practical — in your home, school, or future work", timeSec: 45 },
      ],
    },
  },
  {
    title: "India's Space Programme",
    gradeBand: "BAND_6_8",
    level: 3,
    character: "Priya",
    openingLine: "Chandrayaan-3 landing near the Moon's south pole was incredible! Are you following ISRO?",
    script: {
      turns: [
        { aiText: "What do you know about India's space programme and what has ISRO achieved so far?", hint: "Mention key milestones — Chandrayaan, Mangalyaan, PSLV, or others", timeSec: 45 },
        { aiText: "Why is space exploration important for a developing country like India?", hint: "Think about technology, national pride, practical applications like weather forecasting", timeSec: 45 },
        { aiText: "ISRO missions cost far less than NASA's — how does India manage to do this?", hint: "Talk about engineering choices, cost management, or human capital", timeSec: 45 },
        { aiText: "What practical benefits does space technology bring to ordinary Indians?", hint: "GPS, weather forecasts, crop monitoring, telecommunications — give examples", timeSec: 45 },
        { aiText: "Should India spend money on space when millions of Indians still live in poverty?", hint: "Present both sides of this debate and then share your own view", timeSec: 45 },
        { aiText: "What space mission would you most like India to undertake next?", hint: "Propose an idea and explain the scientific or practical value", timeSec: 45 },
        { aiText: "If you could be an ISRO scientist, what would you want to work on?", hint: "Pick a specific area — planetary science, rocket design, satellite applications", timeSec: 45 },
      ],
    },
  },

  // ── BAND_9_10  Level 1 ─────────────────────────────────────────────────────
  {
    title: "Career Choices After Class 10",
    gradeBand: "BAND_9_10",
    level: 1,
    character: "Rohan",
    openingLine: "I'm trying to figure out whether to go science or humanities. Big decision! What are you thinking?",
    script: {
      turns: [
        { aiText: "What stream are you considering after Class 10 and what is driving that choice?", hint: "Name the stream and explain the pull factors — interest, career goals, parental advice", timeSec: 40 },
        { aiText: "How much does parental or societal pressure influence your career choices in India?", hint: "Be honest — reflect on the role of family expectations versus personal interest", timeSec: 40 },
        { aiText: "What do you think about careers outside engineering and medicine in India today?", hint: "Discuss opportunities in arts, design, psychology, law, entrepreneurship", timeSec: 40 },
        { aiText: "How important is salary when choosing a career? Where do you draw the line between passion and practicality?", hint: "Discuss the balance — financial security vs doing what you love", timeSec: 40 },
        { aiText: "What new career fields do you think will be important in India over the next 20 years?", hint: "Consider AI, climate tech, healthcare, creative industries, space", timeSec: 40 },
        { aiText: "What advice would you give a Class 9 student who has no idea what career they want?", hint: "Give practical, actionable steps — not just 'follow your passion'", timeSec: 40 },
      ],
    },
  },
  {
    title: "Technology and Society",
    gradeBand: "BAND_9_10",
    level: 1,
    character: "Rohan",
    openingLine: "Technology is reshaping everything — jobs, education, relationships. What do you make of it all?",
    script: {
      turns: [
        { aiText: "How has technology changed daily life in India most significantly over the last decade?", hint: "Consider smartphones, UPI payments, digital education, or healthcare", timeSec: 40 },
        { aiText: "What are the biggest risks that technology poses to society and individuals?", hint: "Discuss privacy, job displacement, misinformation, addiction, or inequality", timeSec: 40 },
        { aiText: "Is artificial intelligence a threat to Indian jobs? Which sectors are most at risk?", hint: "Think about manufacturing, data entry, customer service, even white-collar work", timeSec: 40 },
        { aiText: "India has a large digital divide — millions lack internet access. What should be done?", hint: "Propose policy solutions — infrastructure, affordability, digital literacy", timeSec: 40 },
        { aiText: "How has social media changed Indian politics and public debate? Is this change positive or negative?", hint: "Give specific examples — awareness campaigns, misinformation, political polarisation", timeSec: 40 },
        { aiText: "What responsibilities do technology companies have towards the societies they operate in?", hint: "Think about data privacy, content moderation, tax, and worker rights", timeSec: 40 },
      ],
    },
  },
  {
    title: "Indian Identity and Culture",
    gradeBand: "BAND_9_10",
    level: 1,
    character: "Rohan",
    openingLine: "Being Indian means so many different things to different people. How do you define your Indian identity?",
    script: {
      turns: [
        { aiText: "What aspects of Indian culture are you most proud of and why?", hint: "Think about arts, philosophy, diversity, history, cuisine, family values", timeSec: 40 },
        { aiText: "How do you balance being part of a globalised world while maintaining your Indian identity?", hint: "Talk about language, food, values, clothing, or celebrations you maintain", timeSec: 40 },
        { aiText: "India is extraordinarily diverse. How does this diversity strengthen or complicate national identity?", hint: "Discuss language, religion, region, caste — both the richness and the tensions", timeSec: 40 },
        { aiText: "Are there aspects of Indian culture or tradition that you think need to change?", hint: "Be thoughtful — think about gender roles, caste discrimination, or superstition", timeSec: 40 },
        { aiText: "How has Western cultural influence affected Indian youth and is that a problem?", hint: "Give examples of adoption and resistance — and your own view on whether it matters", timeSec: 40 },
        { aiText: "What does it mean to be a responsible Indian citizen in 2025?", hint: "Connect citizenship to specific actions — voting, environmental responsibility, civic engagement", timeSec: 40 },
      ],
    },
  },

  // ── BAND_9_10  Level 2 ─────────────────────────────────────────────────────
  {
    title: "Climate Change and India's Response",
    gradeBand: "BAND_9_10",
    level: 2,
    character: "Rohan",
    openingLine: "India is both a major emitter and a major victim of climate change. It's a complicated position. What do you think?",
    script: {
      turns: [
        { aiText: "How do climate change's effects specifically threaten India's food security and water supply?", hint: "Discuss monsoon changes, glacial retreat in Himalayas, coastal flooding", timeSec: 45 },
        { aiText: "India argues that rich countries, who caused most historical emissions, should do more. Is this argument fair?", hint: "Present the equity argument and the counter — India's current high emissions", timeSec: 45 },
        { aiText: "What has India committed to in international climate agreements and how seriously is it following through?", hint: "Discuss COP commitments, renewable energy targets, India's track record", timeSec: 45 },
        { aiText: "What is the role of individual behaviour change versus systemic government policy in solving climate change?", hint: "Argue which matters more and why individual action alone is insufficient", timeSec: 45 },
        { aiText: "How can India pursue economic development for its poor while simultaneously cutting emissions?", hint: "Explore the tension — growth for hundreds of millions vs climate responsibility", timeSec: 45 },
        { aiText: "What technologies or innovations give you most hope for solving climate change?", hint: "Solar, green hydrogen, nuclear, carbon capture — explain the potential", timeSec: 45 },
        { aiText: "If you were advising the Indian Prime Minister on climate policy, what would be your top three recommendations?", hint: "Be specific and realistic — consider economics, politics, and social impact", timeSec: 45 },
      ],
    },
  },
  {
    title: "Education System in India",
    gradeBand: "BAND_9_10",
    level: 2,
    character: "Rohan",
    openingLine: "I've been thinking a lot about whether our education system is preparing us for the real world. What's your take?",
    script: {
      turns: [
        { aiText: "What does the Indian education system do well that you genuinely appreciate?", hint: "Be fair — give credit where it's due before moving to criticism", timeSec: 45 },
        { aiText: "What are the most serious failures of the current education system?", hint: "Think about rote learning, exam pressure, inequality, lack of critical thinking", timeSec: 45 },
        { aiText: "How does board exam pressure affect students' mental health and overall development?", hint: "Be personal and specific — what have you or your peers experienced?", timeSec: 45 },
        { aiText: "Does the current curriculum prepare students for the careers that will exist in 2040?", hint: "Identify what skills are needed but not being taught", timeSec: 45 },
        { aiText: "How does the quality of education differ between government and private schools?", hint: "Consider access, infrastructure, teacher quality, and outcomes — why does the gap exist?", timeSec: 45 },
        { aiText: "What does the new National Education Policy 2020 aim to change and do you think it will work?", hint: "Discuss key features — multidisciplinary, mother tongue, vocational — and your assessment", timeSec: 45 },
        { aiText: "If you could redesign one aspect of school education in India, what would it be and why?", hint: "Pick one specific reform and argue for it with evidence and reasoning", timeSec: 45 },
      ],
    },
  },
  {
    title: "Entrepreneurship and Innovation in India",
    gradeBand: "BAND_9_10",
    level: 2,
    character: "Rohan",
    openingLine: "India has the third-largest startup ecosystem in the world. That's incredible! What do you think drives this?",
    script: {
      turns: [
        { aiText: "What factors have made India such a fertile ground for startups and entrepreneurs?", hint: "Consider large market, young population, tech talent, mobile internet, UPI", timeSec: 45 },
        { aiText: "Name an Indian startup or entrepreneur you find most impressive and explain what they built.", hint: "Describe the company, what problem it solves, and why it impresses you", timeSec: 45 },
        { aiText: "What are the biggest barriers to entrepreneurship for young Indians, especially from rural areas?", hint: "Think about capital, networks, education, risk tolerance, family pressure", timeSec: 45 },
        { aiText: "Is entrepreneurship glamourised too much in India? Does every student need to build a startup?", hint: "Challenge the narrative — discuss the alternative value of skilled trades, civil service, or research", timeSec: 45 },
        { aiText: "How can innovation solve some of India's most pressing social problems?", hint: "Name a specific problem — clean water, healthcare access, farmer income — and an innovative approach", timeSec: 45 },
        { aiText: "What role should government play in supporting or getting out of the way of entrepreneurs?", hint: "Discuss regulation, ease of doing business, public investment in research", timeSec: 45 },
        { aiText: "If you were to start a venture, what problem would you tackle and why?", hint: "Identify a real problem you care about and outline your basic solution", timeSec: 45 },
      ],
    },
  },

  // ── BAND_9_10  Level 3 ─────────────────────────────────────────────────────
  {
    title: "India's Role in a Changing World",
    gradeBand: "BAND_9_10",
    level: 3,
    character: "Rohan",
    openingLine: "India just hosted the G20 and is increasingly seen as a global power. What does that mean for us?",
    script: {
      turns: [
        { aiText: "How has India's position in the world changed over the last 30 years and what drove that change?", hint: "Discuss economic growth, technology, nuclear capability, soft power, diaspora", timeSec: 50 },
        { aiText: "India positions itself as a leader of the Global South. What does this mean and is it credible?", hint: "Explain the concept and assess India's actual influence versus ambition", timeSec: 50 },
        { aiText: "How should India navigate the relationship between the US and China as great power rivalry intensifies?", hint: "Discuss strategic autonomy, QUAD, BRICS, and India's balancing act", timeSec: 50 },
        { aiText: "What must India fix domestically to be taken seriously as a global leader?", hint: "Think about poverty, inequality, institutional quality, freedom of press, democratic norms", timeSec: 50 },
        { aiText: "How does India's soft power — culture, Bollywood, yoga, food, diaspora — help its foreign policy?", hint: "Give specific examples of cultural diplomacy and its tangible effects", timeSec: 50 },
        { aiText: "What kind of global leader should India be — one that follows existing rules or one that rewrites them?", hint: "Debate norm-following versus norm-shaping — with examples from India's behaviour", timeSec: 50 },
        { aiText: "What do you think India's place in the world will look like in 2047, India's centenary of independence?", hint: "Be ambitious but realistic — name specific domains where India could lead", timeSec: 50 },
        { aiText: "What responsibility does your generation have in shaping India's future global role?", hint: "Connect the macro picture to what students can actually do in their careers and civic life", timeSec: 50 },
      ],
    },
  },
  {
    title: "Artificial Intelligence: Opportunity or Threat?",
    gradeBand: "BAND_9_10",
    level: 3,
    character: "Rohan",
    openingLine: "AI is the biggest technology shift of our lifetime. I find it exciting and terrifying at the same time. You?",
    script: {
      turns: [
        { aiText: "How is artificial intelligence already present in your daily life, even in ways you might not notice?", hint: "Think about search engines, recommendation systems, voice assistants, credit scoring", timeSec: 50 },
        { aiText: "What are the most exciting opportunities AI creates for India and for students like you?", hint: "Consider healthcare, agriculture, education, language barriers, scientific research", timeSec: 50 },
        { aiText: "What are the most serious risks or harms AI could cause in Indian society?", hint: "Discuss job displacement, algorithmic bias, mass surveillance, deepfakes, or concentration of power", timeSec: 50 },
        { aiText: "AI systems can reflect and amplify biases present in training data — what does this mean for India?", hint: "Think about caste, gender, language, or regional bias encoded into AI systems", timeSec: 50 },
        { aiText: "Should AI be allowed to make important decisions — in criminal justice, medical diagnosis, or job hiring?", hint: "Argue for the limits of AI decision-making and what safeguards are essential", timeSec: 50 },
        { aiText: "Who should regulate AI — governments, international bodies, or the companies building it?", hint: "Assess the strengths and weaknesses of each approach with real examples", timeSec: 50 },
        { aiText: "What skills should students develop today to remain relevant in an AI-dominated economy?", hint: "Go beyond 'coding' — think about critical thinking, creativity, emotional intelligence", timeSec: 50 },
        { aiText: "Do you think superintelligent AI — smarter than humans at everything — will ever exist? Should we want it?", hint: "Engage with both the technical uncertainty and the philosophical and ethical dimensions", timeSec: 50 },
      ],
    },
  },
  {
    title: "Democracy, Youth, and Civic Life",
    gradeBand: "BAND_9_10",
    level: 3,
    character: "Rohan",
    openingLine: "Young voters are shaping elections globally. I think our generation has real power. Do you?",
    script: {
      turns: [
        { aiText: "What does democracy mean to you beyond just voting once every five years?", hint: "Discuss the deeper meaning — accountability, rights, civic participation, freedom of expression", timeSec: 50 },
        { aiText: "How healthy is Indian democracy in 2025 — what is working well and what is under strain?", hint: "Engage honestly — institutions, press freedom, judicial independence, electoral integrity", timeSec: 50 },
        { aiText: "Why do many young people feel disconnected from or disillusioned with politics?", hint: "Explore structural barriers, cynicism, corruption, polarisation, lack of representation", timeSec: 50 },
        { aiText: "Social media is increasingly influential in elections — is this good or bad for democracy?", hint: "Discuss voter mobilisation, misinformation, echo chambers, and foreign interference", timeSec: 50 },
        { aiText: "What responsibilities come with the right to vote and how should young voters prepare?", hint: "Go beyond voting — discuss how to evaluate candidates, platforms, and track records", timeSec: 50 },
        { aiText: "What civic actions beyond voting can young Indians take to improve their communities?", hint: "Think about volunteering, RTI, attending local government meetings, activism, journalism", timeSec: 50 },
        { aiText: "If you could change one thing about how Indian democracy works, what would it be?", hint: "Make a specific, well-reasoned proposal — electoral reforms, decentralisation, media regulation", timeSec: 50 },
        { aiText: "What gives you hope about the future of democracy and India's young generation?", hint: "End on something genuine — not vague optimism, but a specific reason to be hopeful", timeSec: 50 },
      ],
    },
  },
];
