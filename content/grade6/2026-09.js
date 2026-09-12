(function () {
  const grade6Days = [
    {
      id: 'sday1',
      date: '2026-09-10',
      title: 'Saturday Morning',
      emoji: '🏀',
      storyEn: "Ben wakes up at eight o'clock. He eats breakfast with his family. His mom makes eggs and toast. After breakfast, Ben rides his bike to the park. He meets his best friend, Leo, there. They play basketball together until noon. It is a happy morning.",
      previewWords: [
        { en: 'wake up', pos: '片語動詞', zh: '醒來', def: 'to stop sleeping and open your eyes' },
        { en: 'breakfast', pos: 'n.', zh: '早餐', def: 'the first meal you eat in the morning' },
        { en: 'toast', pos: 'n.', zh: '吐司', def: 'bread that is heated until it turns brown' },
        { en: 'ride', pos: 'v.', zh: '騎', def: 'to sit on a bike and make it move' },
        { en: 'bike', pos: 'n.', zh: '腳踏車', def: 'a vehicle with two wheels you pedal' },
        { en: 'meet', pos: 'v.', zh: '遇見、碰面', def: 'to see and spend time with someone' },
        { en: 'basketball', pos: 'n.', zh: '籃球', def: 'a game where players throw a ball into a hoop' },
        { en: 'together', pos: 'adv.', zh: '一起', def: 'with another person, not alone' },
        { en: 'until', pos: 'prep.', zh: '直到', def: 'up to a certain time' }
      ],
      mc: [
        { q: "What time does Ben wake up?", options: ["Seven o'clock", "Eight o'clock", "Nine o'clock"], answer: 1 },
        { q: "Who makes breakfast for Ben?", options: ["His dad", "His mom", "Leo"], answer: 1 },
        { q: "Where does Ben ride his bike?", options: ["To school", "To the park", "To Leo's house"], answer: 1 },
        { q: "What does Ben eat for breakfast?", options: ["Eggs and toast", "Cereal and milk", "Pancakes"], answer: 0 },
        { q: "What do Ben and Leo play together?", options: ["Soccer", "Basketball", "Baseball"], answer: 1 }
      ],
      short: []
    },
    {
      id: 'sday2',
      date: '2026-09-11',
      title: 'After School',
      emoji: '🎒',
      storyEn: "Mia finishes school at three o'clock. She walks home with her neighbor, Zoe. On the way, they stop at a small shop and buy some snacks. At home, Mia does her homework before dinner. After dinner, she reads a book and goes to bed early.",
      previewWords: [
        { en: 'finish', pos: 'v.', zh: '完成、結束', def: 'to come to the end of something' },
        { en: 'neighbor', pos: 'n.', zh: '鄰居', def: 'someone who lives near you' },
        { en: 'stop', pos: 'v.', zh: '停下', def: 'to not continue moving or doing something' },
        { en: 'shop', pos: 'n.', zh: '商店', def: 'a small place where you buy things' },
        { en: 'snack', pos: 'n.', zh: '點心、零食', def: 'a small amount of food eaten between meals' },
        { en: 'homework', pos: 'n.', zh: '功課', def: 'school work you do at home' },
        { en: 'before', pos: 'prep.', zh: '在…之前', def: 'earlier than a certain time' },
        { en: 'early', pos: 'adv.', zh: '早', def: 'near the beginning of a time period' }
      ],
      mc: [
        { q: "What time does Mia finish school?", options: ["Two o'clock", "Three o'clock", "Four o'clock"], answer: 1 },
        { q: "Who does Mia walk home with?", options: ["Her mom", "Zoe", "Her teacher"], answer: 1 },
        { q: "Where do they stop on the way?", options: ["A park", "A small shop", "A library"], answer: 1 },
        { q: "What does Mia do before dinner?", options: ["Watches TV", "Does her homework", "Plays outside"], answer: 1 },
        { q: "What does Mia do after dinner?", options: ["Reads a book", "Talks to Zoe", "Draws a picture"], answer: 0 }
      ],
      short: []
    },
    {
      id: 'sday3',
      date: '2026-09-12',
      title: 'A Rainy Day',
      emoji: '🌧️',
      storyEn: "It is raining outside today. Tom cannot play soccer with his friends. Instead, he stays home and draws a picture of a dragon. His little sister watches him and laughs. Later, they drink hot chocolate together and watch a movie. It is still a fun day.",
      previewWords: [
        { en: 'rain', pos: 'v.', zh: '下雨', def: 'when water falls from the sky' },
        { en: 'outside', pos: 'adv.', zh: '在外面', def: 'not inside a building' },
        { en: 'instead', pos: 'adv.', zh: '取而代之', def: 'in place of something else' },
        { en: 'draw', pos: 'v.', zh: '畫', def: 'to make a picture with a pencil or pen' },
        { en: 'laugh', pos: 'v.', zh: '笑', def: 'to make a sound when something is funny' },
        { en: 'later', pos: 'adv.', zh: '之後', def: 'after the present time' },
        { en: 'together', pos: 'adv.', zh: '一起', def: 'with another person, not alone' },
        { en: 'still', pos: 'adv.', zh: '仍然', def: 'continuing up to this time' }
      ],
      mc: [
        { q: "Why can't Tom play soccer?", options: ["He is sick", "It is raining", "He has no friends"], answer: 1 },
        { q: "What does Tom draw?", options: ["A dragon", "A car", "A house"], answer: 0 },
        { q: "What do they drink together?", options: ["Juice", "Milk", "Hot chocolate"], answer: 2 },
        { q: "Who watches Tom and laughs?", options: ["His mom", "His little sister", "His friend"], answer: 1 },
        { q: "What do they do after they drink hot chocolate?", options: ["Go to bed", "Play a game", "Watch a movie"], answer: 2 }
      ],
      short: []
    },
    {
      id: 'sday4',
      date: '2026-09-13',
      title: 'The School Trip',
      emoji: '🦁',
      storyEn: "Next Friday, our class will visit the zoo. Everyone is very excited about the trip. We will see lions, elephants, and monkeys there. Our teacher says we must stay together and listen carefully. After lunch, we will take photos near the big tiger.",
      previewWords: [
        { en: 'visit', pos: 'v.', zh: '參觀', def: 'to go and see a place' },
        { en: 'excited', pos: 'adj.', zh: '興奮的', def: 'feeling very happy about something' },
        { en: 'trip', pos: 'n.', zh: '旅行', def: 'a journey to a place' },
        { en: 'elephant', pos: 'n.', zh: '大象', def: 'a very large animal with a long nose' },
        { en: 'monkey', pos: 'n.', zh: '猴子', def: 'an animal that climbs trees and looks like a small person' },
        { en: 'carefully', pos: 'adv.', zh: '小心地', def: 'in a way that pays close attention' },
        { en: 'listen', pos: 'v.', zh: '聆聽', def: 'to pay attention to a sound' },
        { en: 'photo', pos: 'n.', zh: '照片', def: 'a picture taken with a camera' },
        { en: 'tiger', pos: 'n.', zh: '老虎', def: 'a large wild cat with orange and black stripes' }
      ],
      mc: [
        { q: "Where will the class visit?", options: ["The museum", "The zoo", "The park"], answer: 1 },
        { q: "What must the students do?", options: ["Run fast", "Stay together and listen carefully", "Buy snacks"], answer: 1 },
        { q: "When will they take photos?", options: ["Before lunch", "After lunch", "In the morning"], answer: 1 },
        { q: "What animals will they see?", options: ["Lions, elephants, and monkeys", "Tigers and bears", "Birds and fish"], answer: 0 },
        { q: "What will they do near the big tiger?", options: ["Feed it", "Take photos", "Draw a picture"], answer: 1 }
      ],
      short: []
    },
    {
      id: 'sday5',
      date: '2026-09-14',
      title: 'The Lost Puppy',
      emoji: '🐶',
      storyEn: "On Monday, Amy finds a small puppy near the school gate. The puppy looks hungry and scared. Amy gives it some food and water. She asks her classmates if they know the owner. Finally, they find the owner, an old man who lives nearby. He thanks Amy for her kindness.",
      previewWords: [
        { en: 'find', pos: 'v.', zh: '找到、發現', def: 'to see or discover something' },
        { en: 'hungry', pos: 'adj.', zh: '飢餓的', def: 'feeling like you need to eat' },
        { en: 'scared', pos: 'adj.', zh: '害怕的', def: 'feeling afraid' },
        { en: 'classmate', pos: 'n.', zh: '同學', def: 'a student in the same class as you' },
        { en: 'owner', pos: 'n.', zh: '主人', def: 'a person who has something' },
        { en: 'finally', pos: 'adv.', zh: '最後、終於', def: 'after a long time' },
        { en: 'nearby', pos: 'adv.', zh: '在附近', def: 'not far away' },
        { en: 'thank', pos: 'v.', zh: '感謝', def: 'to tell someone you are grateful' },
        { en: 'kindness', pos: 'n.', zh: '善良、好心', def: 'being kind and helpful to others' }
      ],
      mc: [
        { q: "What does Amy find near the school gate?", options: ["A puppy", "A cat", "A bird"], answer: 0 },
        { q: "How does the puppy look?", options: ["Happy", "Hungry and scared", "Sleepy"], answer: 1 },
        { q: "What does Amy give the puppy?", options: ["A toy", "Food and water", "A blanket"], answer: 1 },
        { q: "Who is the owner?", options: ["A teacher", "An old man", "A classmate"], answer: 1 },
        { q: "What does the owner do at the end?", options: ["Thanks Amy", "Scolds Amy", "Ignores Amy"], answer: 0 }
      ],
      short: []
    },
    {
      id: 'sday6',
      date: '2026-09-15',
      title: "Grandma's Garden",
      emoji: '🌻',
      storyEn: "Every Sunday, Leo visits his grandma's garden. She grows tomatoes, carrots, and sunflowers there. Leo helps her water the plants and pull out the weeds. Grandma teaches him how to plant new seeds. After working, they sit under a big tree and eat fresh fruit. Leo loves these quiet afternoons with her.",
      previewWords: [
        { en: 'visit', pos: 'v.', zh: '拜訪', def: 'to go and see someone' },
        { en: 'grow', pos: 'v.', zh: '種植、生長', def: 'to plant something and let it get bigger' },
        { en: 'plant', pos: 'v./n.', zh: '種植、植物', def: 'to put a seed in the ground; a living thing that grows in soil' },
        { en: 'weed', pos: 'n.', zh: '雜草', def: 'a wild plant growing where it is not wanted' },
        { en: 'seed', pos: 'n.', zh: '種子', def: 'a small thing a plant grows from' },
        { en: 'fresh', pos: 'adj.', zh: '新鮮的', def: 'newly made or picked, not old' },
        { en: 'quiet', pos: 'adj.', zh: '安靜的', def: 'making little or no noise' },
        { en: 'afternoon', pos: 'n.', zh: '下午', def: 'the part of the day between noon and evening' },
        { en: 'garden', pos: 'n.', zh: '花園', def: 'a piece of land where plants are grown' }
      ],
      mc: [
        { q: "When does Leo visit his grandma?", options: ["Every Monday", "Every Sunday", "Every Saturday"], answer: 1 },
        { q: "What does grandma grow?", options: ["Tomatoes, carrots, and sunflowers", "Apples and pears", "Rice and corn"], answer: 0 },
        { q: "What does Leo help with?", options: ["Cooking", "Watering plants and pulling weeds", "Cleaning the house"], answer: 1 },
        { q: "What does grandma teach Leo?", options: ["How to plant new seeds", "How to cook", "How to draw"], answer: 0 },
        { q: "Where do they sit after working?", options: ["In the kitchen", "Under a big tree", "In the car"], answer: 1 }
      ],
      short: []
    },
    {
      id: 'sday7',
      date: '2026-09-16',
      title: 'The Science Fair',
      emoji: '🌋',
      storyEn: "Next month, Daniel's school will hold a science fair. He decides to build a small volcano model with his partner, Sam. They mix baking soda and vinegar to make it erupt. At first, the model does not work well, so they try again carefully. On the day of the fair, their volcano finally erupts, and everyone claps.",
      previewWords: [
        { en: 'decide', pos: 'v.', zh: '決定', def: 'to choose something after thinking about it' },
        { en: 'build', pos: 'v.', zh: '建造、製作', def: 'to make something by putting parts together' },
        { en: 'partner', pos: 'n.', zh: '夥伴', def: 'a person you work with' },
        { en: 'mix', pos: 'v.', zh: '混合', def: 'to put different things together' },
        { en: 'erupt', pos: 'v.', zh: '噴發', def: 'to burst out suddenly' },
        { en: 'at first', pos: '片語', zh: '一開始', def: 'at the beginning' },
        { en: 'carefully', pos: 'adv.', zh: '小心地', def: 'in a way that pays close attention' },
        { en: 'finally', pos: 'adv.', zh: '最後、終於', def: 'after a long time' },
        { en: 'clap', pos: 'v.', zh: '鼓掌', def: 'to hit your hands together to show you like something' }
      ],
      mc: [
        { q: "What will Daniel's school hold?", options: ["A sports day", "A science fair", "A music concert"], answer: 1 },
        { q: "What does Daniel build?", options: ["A robot", "A volcano model", "A bridge"], answer: 1 },
        { q: "What do they mix to make it erupt?", options: ["Water and sugar", "Baking soda and vinegar", "Salt and oil"], answer: 1 },
        { q: "What happens at first?", options: ["The model works perfectly", "The model does not work well", "The model breaks"], answer: 1 },
        { q: "What do people do when the volcano erupts?", options: ["They clap", "They leave", "They cry"], answer: 0 }
      ],
      short: []
    },
    {
      id: 'sday8',
      date: '2026-09-17',
      title: 'A New Neighbor',
      emoji: '🏸',
      storyEn: "Last week, a new family moved into the house next door. Their daughter, Emma, is the same age as Chloe. At first, Chloe feels shy and does not know what to say. One afternoon, Emma invites Chloe to play badminton in the yard. They laugh a lot and quickly become good friends. Now they walk to school together every day.",
      previewWords: [
        { en: 'move', pos: 'v.', zh: '搬家', def: 'to go and live in a new place' },
        { en: 'neighbor', pos: 'n.', zh: '鄰居', def: 'someone who lives near you' },
        { en: 'shy', pos: 'adj.', zh: '害羞的', def: 'nervous about talking to other people' },
        { en: 'invite', pos: 'v.', zh: '邀請', def: 'to ask someone to come and do something' },
        { en: 'yard', pos: 'n.', zh: '院子', def: 'an outdoor area next to a house' },
        { en: 'laugh', pos: 'v.', zh: '笑', def: 'to make a sound when something is funny' },
        { en: 'quickly', pos: 'adv.', zh: '很快地', def: 'in a short amount of time' },
        { en: 'friend', pos: 'n.', zh: '朋友', def: 'a person you like and enjoy being with' },
        { en: 'together', pos: 'adv.', zh: '一起', def: 'with another person, not alone' }
      ],
      mc: [
        { q: "What happened last week?", options: ["A new family moved in", "Chloe moved away", "School started"], answer: 0 },
        { q: "How does Chloe feel at first?", options: ["Excited", "Shy", "Angry"], answer: 1 },
        { q: "What does Emma invite Chloe to do?", options: ["Play badminton", "Watch a movie", "Do homework"], answer: 0 },
        { q: "How do Chloe and Emma become friends?", options: ["They fight and make up", "They laugh a lot together", "Their parents introduce them"], answer: 1 },
        { q: "What do they do every day now?", options: ["Play video games", "Walk to school together", "Do homework together"], answer: 1 }
      ],
      short: []
    },
    {
      id: 'sday9',
      date: '2026-09-18',
      title: 'The Camping Trip',
      emoji: '⛺',
      storyEn: "During summer vacation, Jack's family goes camping by the lake. They set up a big tent and start a small campfire. At night, Jack's dad tells funny stories while they roast marshmallows. Jack hears owls hooting in the dark forest and feels a little nervous. In the morning, everyone wakes up early to watch the sunrise together.",
      previewWords: [
        { en: 'vacation', pos: 'n.', zh: '假期', def: 'time away from school or work' },
        { en: 'tent', pos: 'n.', zh: '帳篷', def: 'a shelter made of cloth for camping' },
        { en: 'campfire', pos: 'n.', zh: '營火', def: 'a fire made outdoors while camping' },
        { en: 'roast', pos: 'v.', zh: '烤', def: 'to cook something over a fire' },
        { en: 'marshmallow', pos: 'n.', zh: '棉花糖', def: 'a soft, sweet white candy' },
        { en: 'hoot', pos: 'v.', zh: '(貓頭鷹)鳴叫', def: 'the sound an owl makes' },
        { en: 'nervous', pos: 'adj.', zh: '緊張的', def: 'feeling worried or a little afraid' },
        { en: 'sunrise', pos: 'n.', zh: '日出', def: 'when the sun comes up in the morning' },
        { en: 'forest', pos: 'n.', zh: '森林', def: 'a large area covered with trees' }
      ],
      mc: [
        { q: "Where does Jack's family go camping?", options: ["By the lake", "In the mountains", "At the beach"], answer: 0 },
        { q: "What do they do at night?", options: ["Watch TV", "Tell stories and roast marshmallows", "Go swimming"], answer: 1 },
        { q: "What does Jack hear in the forest?", options: ["Owls hooting", "Dogs barking", "Music playing"], answer: 0 },
        { q: "How does Jack feel when he hears the owls?", options: ["Excited", "A little nervous", "Bored"], answer: 1 },
        { q: "What does everyone do in the morning?", options: ["Sleep in", "Wake up early to watch the sunrise", "Go home"], answer: 1 }
      ],
      short: []
    },
    {
      id: 'sday10',
      date: '2026-09-19',
      title: 'The Talent Show',
      emoji: '🎤',
      storyEn: "Every year, Riverside Elementary holds a talent show for all students. This year, Sophie wants to sing a song on stage, but she feels very nervous. Her best friend, Grace, practices with her every day after school. On the night of the show, Sophie takes a deep breath and sings bravely. The audience claps loudly, and Sophie feels very proud.",
      previewWords: [
        { en: 'talent show', pos: '片語', zh: '才藝表演', def: 'an event where people show a special skill' },
        { en: 'nervous', pos: 'adj.', zh: '緊張的', def: 'feeling worried or a little afraid' },
        { en: 'practice', pos: 'v.', zh: '練習', def: 'to do something again and again to get better' },
        { en: 'stage', pos: 'n.', zh: '舞台', def: 'a raised platform where people perform' },
        { en: 'deep breath', pos: '片語', zh: '深呼吸', def: 'a big breath of air' },
        { en: 'bravely', pos: 'adv.', zh: '勇敢地', def: 'in a brave way, without giving up to fear' },
        { en: 'audience', pos: 'n.', zh: '觀眾', def: 'the people watching a show' },
        { en: 'loudly', pos: 'adv.', zh: '大聲地', def: 'in a loud way' },
        { en: 'proud', pos: 'adj.', zh: '驕傲的', def: 'feeling good about something you did' }
      ],
      mc: [
        { q: "What does the school hold every year?", options: ["A talent show", "A sports day", "A field trip"], answer: 0 },
        { q: "What does Sophie want to do?", options: ["Dance", "Sing a song", "Tell jokes"], answer: 1 },
        { q: "Who practices with Sophie?", options: ["Her teacher", "Her mom", "Her best friend, Grace"], answer: 2 },
        { q: "What does Sophie do before singing?", options: ["Takes a deep breath", "Runs away", "Cries"], answer: 0 },
        { q: "How does Sophie feel after the show?", options: ["Embarrassed", "Very proud", "Angry"], answer: 1 }
      ],
      short: []
    },
    {
      id: 'sday11',
      date: '2026-09-20',
      title: 'The Time Capsule',
      emoji: '⏳',
      storyEn: "On the last day of school, Mr. Lee's class buries a time capsule under the old oak tree. Each student puts something special inside, like photos, letters, and small toys. They plan to open it again in ten years. Ben writes a letter to his future self, promising to stay curious and kind. Everyone feels excited about the future.",
      previewWords: [
        { en: 'bury', pos: 'v.', zh: '埋', def: 'to put something under the ground' },
        { en: 'capsule', pos: 'n.', zh: '膠囊（此指時光膠囊）', def: 'a small closed container' },
        { en: 'special', pos: 'adj.', zh: '特別的', def: 'not ordinary; important in some way' },
        { en: 'plan', pos: 'v.', zh: '計畫', def: 'to think about what you will do' },
        { en: 'future', pos: 'n./adj.', zh: '未來', def: 'the time that has not happened yet' },
        { en: 'promise', pos: 'v.', zh: '承諾', def: 'to say you will definitely do something' },
        { en: 'curious', pos: 'adj.', zh: '好奇的', def: 'wanting to learn or know about something' },
        { en: 'excited', pos: 'adj.', zh: '興奮的', def: 'feeling very happy about something' },
        { en: 'letter', pos: 'n.', zh: '信', def: 'a written message sent to someone' }
      ],
      mc: [
        { q: "What does the class bury?", options: ["A treasure box", "A time capsule", "A photo album"], answer: 1 },
        { q: "Where do they bury it?", options: ["Under the old oak tree", "In the classroom", "In the garden"], answer: 0 },
        { q: "When do they plan to open it?", options: ["Next year", "In ten years", "Tomorrow"], answer: 1 },
        { q: "What does Ben write?", options: ["A story", "A letter to his future self", "A song"], answer: 1 },
        { q: "How does everyone feel about the future?", options: ["Scared", "Excited", "Bored"], answer: 1 }
      ],
      short: []
    }
  ];

  window.GRADE6_DAYS = (window.GRADE6_DAYS || []).concat(grade6Days);
})();
