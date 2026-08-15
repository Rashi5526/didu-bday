Build a fully functional, mobile-first multiplayer web app called **“The Birthday Girl Game Night”**.

This is a private birthday experience created by a family for one sister. Exactly **5 players** will join from their own phones and play together in real time. The birthday girl is one of the 5 players.

The app should feel extremely personal, warm, premium, playful, aesthetic and emotionally meaningful — NOT like a generic Kahoot, quiz app, or party-game website.

The entire experience should be designed for mobile phones first, because all 5 players will use their phones.

IMPORTANT:

* Build the actual functional frontend AND backend/data layer.
* Do not create only a visual prototype.
* Players must be able to join from different phones.
* Their answers, scores, game progress and responses must synchronize in real time.
* Create persistent game/session state.
* The host should be able to create a private game room and share a room code.
* Players should be able to join using the room code.
* No login/signup should be required.
* Use a simple nickname/player-name system.
* The game must support exactly 5 players.
* Make the architecture practical so I can actually run and use this immediately after deployment.
* If the environment supports Supabase/Firebase or another backend/database, use it for real-time multiplayer state and persistence.
* If backend credentials/configuration are required, clearly isolate them in environment variables and create the necessary setup instructions.
* Do not fake multiplayer behavior with local-only state.

---

## 1. VISUAL DIRECTION

---

The aesthetic should be:

* Premium
* Warm
* Feminine but NOT overly pink
* Elegant
* Cozy
* Slightly Gen-Z
* Emotional
* Editorial
* Playful
* Birthday-themed without looking childish

Think:

“Luxury birthday dinner + private family memory book + modern interactive game.”

Use a sophisticated palette such as:

* warm ivory
* champagne
* soft blush
* muted burgundy
* deep brown
* subtle gold accents

Avoid:

* neon colours
* childish birthday graphics
* excessive balloons
* generic confetti everywhere
* cartoonish UI
* overly bright pink
* corporate dashboard aesthetics

Typography should feel premium and editorial.

Use a beautiful serif/display font for major headings and a clean modern sans-serif for body text.

Use subtle:

* glass effects
* soft shadows
* rounded cards
* elegant borders
* micro animations
* smooth transitions
* subtle grain/texture where appropriate

The interface should feel like someone intentionally designed this birthday experience.

---

## 2. LANDING SCREEN

---

Create a beautiful opening screen.

Headline:

“Tonight is all about her.”

Subheading:

“5 people. One birthday girl. A questionable amount of childhood lore.”

Primary button:

“Start the Birthday”

Secondary small text:

“A private game night made with love.”

Add a subtle animated background with floating stars/hearts/sparkles, but keep it elegant.

---

## 3. HOST / CREATE GAME

---

Create a simple host setup screen.

The host enters:

* Birthday girl's name
* Host name
* Number of players (default = 5)
* Optional birthday message

Generate a unique 4–6 character room code.

Example:

BDAY27

Show:

“Your room is ready.”

Room code:

BDAY27

Button:

“Share Room”

Also provide:

“Copy Code”

and

“Start Game”

The host should be able to see the players joining in real time.

---

## 4. JOIN GAME

---

Players enter:

ROOM CODE

PLAYER NAME

Then press:

“Join the Birthday”

Show a waiting room.

Example:

THE BIRTHDAY CREW

✓ Rashi
✓ Mom
✓ Dad
✓ Sister
✓ Friend

Display 5 player slots.

Use animated avatars/initials.

When all 5 players have joined, show:

“Everyone's here 👀”

Host can press:

“Let the chaos begin”

---

## 5. PLAYER ROLES

---

There are two logical roles:

HOST
PLAYER

The birthday girl is also a normal PLAYER, but the system should allow the host to designate one player as:

🎂 BIRTHDAY GIRL

The birthday girl should NOT receive special access to answers before other players submit.

The host should control:

* starting rounds
* moving to next question
* revealing answers
* starting bonus rounds
* ending the game

---

# GAME STRUCTURE

---

Create these rounds:

1. WHO KNOWS HER BEST?
2. WHO SAID THIS?
3. ACT LIKE HER
4. MOST LIKELY TO
5. HOW WELL DO YOU REMEMBER?
6. WHO KNOWS HER HEART?
7. GUESS THE PHOTO
8. FINAL MEMORY ROUND

Each round should have its own visual identity while still feeling like the same application.

---

# ROUND 1 — WHO KNOWS HER BEST?

---

This is the main competitive quiz.

Create question categories:

A. The Obvious Ones
B. You SHOULD Know This
C. Only People Close To Her Know
D. What Would She Choose?

Each question should show on every player's phone.

Example:

“What is her comfort food?”

Players select/type their answer.

IMPORTANT:

Everyone must submit before answers are revealed.

Show:

“4/5 answers locked”

Then:

“All answers are in 👀”

The birthday girl then reveals/selects her actual answer.

Host can reveal the correct answer.

Automatically calculate points.

Suggested scoring:

Correct answer = +10
Close answer = +5
Wrong answer = 0

Allow the host/birthday girl to manually mark “Close” where needed.

After reveal show:

YOUR ANSWER
BIRTHDAY GIRL'S ANSWER
RESULT
POINTS

Then show a small scoreboard.

---

# ROUND 2 — WHO SAID THIS?

---

Before the game, the host should be able to enter anonymous statements.

Example:

“I am not hungry.”

“I'll be ready in 5 minutes.”

“I don't want anything.”

“I literally don't care.”

The app randomly shows one statement.

Players guess:

“Who said this?”

The correct person is revealed.

Allow the host to configure the correct answer.

Scoring:

Correct = +10

Create funny reveal animation.

---

# ROUND 3 — ACT LIKE HER

---

Create a random prompt generator.

Example prompts:

“Act like her when she's getting ready and everyone is waiting.”

“Act like her when she is angry.”

“Act like her when she sees something expensive.”

“Act like her when someone wakes her up.”

“Act like her when she says ‘I'm fine.’”

“Act like her talking to Mom.”

“Act like her when she is running late.”

The app randomly selects a prompt.

One player performs it physically.

The birthday girl judges.

Create buttons:

ICONIC — 10 points
VERY GOOD — 7 points
DECENT — 5 points
NOT HER AT ALL — 0 points

The host enters the score.

---

# ROUND 4 — MOST LIKELY TO

---

Show a question:

“Who is most likely to become a millionaire?”

All 5 players select one person.

After everyone submits, show the results simultaneously.

Questions should include:

* Who is most likely to get married first?
* Who is most likely to become famous?
* Who is most likely to move abroad?
* Who is most likely to start a business?
* Who is most likely to spend ₹10,000 without realizing it?
* Who is most likely to survive a zombie apocalypse?
* Who is most likely to become the strictest parent?
* Who is most likely to randomly book a trip tomorrow?
* Who is most likely to become insanely rich?
* Who is most likely to call Mom for help?
* Who is most likely to have the most dramatic life?

After voting show:

“THE FAMILY HAS SPOKEN.”

Then show a result chart.

---

# ROUND 5 — HOW WELL DO YOU REMEMBER US?

---

Create memory-based questions.

Example:

“Where were we when ______ happened?”

“What happened immediately after?”

“How old was she?”

“Who was there?”

“Who said ______?”

The host should be able to enter custom questions and answers.

Players submit answers.

Host reveals the actual story.

Allow host to manually award points.

Add a beautiful “Memory Unlocked” animation.

---

# ROUND 6 — WHO KNOWS HER HEART?

---

This is NOT competitive.

Make this round slower and more emotional.

Questions:

“What do you think makes her happiest?”

“What do you think she needs to hear right now?”

“What is something you admire about her?”

“What do you think she is most proud of?”

“What is one thing you hope she gets this year?”

“What is something you think she doesn't realize about herself?”

“What is one thing you will always be grateful to her for?”

Everyone answers anonymously.

The birthday girl sees the responses one by one.

Show:

“Someone who loves you wrote…”

Then reveal the answer.

The birthday girl can guess who wrote it.

After reveal show the author.

No points.

---

# ROUND 7 — GUESS THE PHOTO

---

The host should be able to upload childhood/family photos before the game.

For every photo allow metadata:

* Photo
* Approximate year
* Location
* People in photo
* Story
* Correct answer

Players see the photo.

Questions can be:

“How old was she?”

“Where was this?”

“Who took this?”

“What happened that day?”

“Who is standing next to her?”

Players answer.

Then reveal:

THE ACTUAL STORY

Make this feel like a digital family memory album.

---

# ROUND 8 — FINAL MEMORY ROUND

---

This is the finale.

Prompt:

“Write something to her that you don't usually say.”

Each player writes a short anonymous message.

Possible prompts:

“One thing I love about you…”

“One memory I'll never forget…”

“One thing I hope happens for you this year…”

“You probably don't know this, but…”

Store all responses.

Display them one at a time.

The birthday girl guesses who wrote each one.

Then reveal the author.

End with:

“5 people came together tonight…”

then:

“…because one person means a lot to all of us.”

Show the birthday girl's name.

Then:

“Happy Birthday ❤️”

---

# FINAL SCOREBOARD

---

After all competitive rounds, show:

🏆 THE BIRTHDAY GIRL GAME NIGHT

1. Player
2. Player
3. Player
4. Player
5. Player

Show:

* Total points
* Correct answers
* Best round

Give funny titles:

🥇 THE PSYCHIC SIBLING
🥈 FAMILY DATABASE
🥉 I THOUGHT I KNEW HER

Other possible awards:

“Knows Her Too Well”
“Absolutely Clueless”
“Suspiciously Accurate”
“Just Here For Food”

Allow the host to customize these titles.

---

# BIRTHDAY GIRL SPECIAL ENDING

---

After the leaderboard, do NOT immediately return to the home screen.

Create a cinematic final screen.

Text appears progressively:

“Tonight wasn't really about winning.”

Then:

“It was about remembering.”

Then:

“The little things.”

Then:

“The embarrassing things.”

Then:

“The stories.”

Then:

“And all the reasons we love you.”

Finally:

“Happy Birthday, [NAME]. ❤️”

Add subtle confetti/sparkles.

Allow the host to press:

“Play Again”

“View Memories”

“Download Memories”

---

# HOST DASHBOARD

---

Create a dedicated host control panel.

Host should be able to:

* Create game
* Edit birthday girl name
* Add/remove players
* Start rounds
* Add custom questions
* Add custom answers
* Upload photos
* Add photo stories
* Add “Who Said This?” statements
* View player answers
* Mark answers correct/close/wrong
* Award manual points
* Skip questions
* Restart question
* Move to next round
* Pause game
* End game
* View final scores
* View all emotional messages
* Export/save memories

Make host controls extremely simple because this will be used during a live family gathering.

---

# ADMIN / CONTENT SETUP

---

Create a pre-game setup flow where I can prepare the entire birthday before everyone arrives.

I should be able to create:

* 20–30 quiz questions
* 10 “Who Said This?” questions
* 15 “Most Likely To” questions
* 10 acting prompts
* 10 memory questions
* 10 emotional questions
* 20 photo questions

The game should randomly select questions from these pools OR allow the host to choose manually.

Save all content to the backend.

---

# REAL-TIME MULTIPLAYER BACKEND

---

This is extremely important.

Implement actual multiplayer synchronization.

Database should store:

GAME SESSION

* session_id
* room_code
* birthday_girl
* host
* status
* current_round
* current_question
* created_at

PLAYERS

* player_id
* session_id
* name
* role
* is_birthday_girl
* joined_at
* score

QUESTIONS

* question_id
* round
* question
* options
* correct_answer
* points

ANSWERS

* answer_id
* session_id
* question_id
* player_id
* answer
* score
* submitted_at

PHOTOS

* photo_id
* session_id
* image_url
* question
* answer
* story

MEMORIES

* memory_id
* session_id
* player_id
* message
* author_revealed

The system should automatically synchronize:

* player joining
* player leaving
* answer submission
* answer count
* question changes
* score updates
* round changes
* answer reveals

If using Supabase, use Supabase Realtime.

If using Firebase, use Firestore realtime listeners.

Choose whichever is easiest and most reliable in the Figma Make environment.

---

# MOBILE UX

---

Design for:

iPhone
Android
Chrome mobile
Safari mobile

Every important interaction should be possible with one hand.

Use:

* large buttons
* large touch targets
* minimal text input
* swipe/transition animations
* bottom-friendly controls

Never require players to zoom.

Do not use desktop-only interactions.

The host dashboard can be slightly more complex but should still work on mobile.

---

# GAME STATES

---

Handle all possible states properly:

WAITING_FOR_PLAYERS
ALL_PLAYERS_JOINED
ROUND_START
QUESTION_ACTIVE
WAITING_FOR_ANSWERS
ALL_ANSWERS_SUBMITTED
REVEAL
SCORING
LEADERBOARD
NEXT_QUESTION
NEXT_ROUND
FINAL
GAME_ENDED

If someone refreshes their browser, they should be able to reconnect to the same session.

If one player disconnects, the other players should continue seeing the correct game state.

---

# MICROINTERACTIONS

---

Add tasteful animations:

* room code reveal
* player joining
* answer submitted
* “locked in” animation
* countdown
* answer reveal
* points flying into scoreboard
* leaderboard movement
* memory reveal
* final birthday animation

Keep animations smooth and premium.

Do NOT make it feel like a children's game.

---

# SOUND

---

Do NOT autoplay audio.

Provide an optional sound toggle.

If enabled, use subtle UI sounds for:

* answer submitted
* reveal
* points
* round transition
* final celebration

---

# PRIVACY

---

This is a private family game.

Do not expose sessions publicly.

Use random room codes.

Players should only access the game session they joined.

Do not require public profiles.

Do not collect unnecessary personal information.

Allow the host to delete the game/session and all associated content after the birthday.

---

# SEED CONTENT

---

Pre-populate the game with enough example questions so I can immediately test it.

Include at least:

30 “Who Knows Her Best?” questions
15 “Most Likely To” questions
15 acting prompts
10 memory questions
10 emotional questions
10 “Who Said This?” examples

Make them genuinely funny, family-friendly and varied.

---

# IMPORTANT FUNCTIONAL REQUIREMENT

---

At the end, provide a clear:

“SETUP / DEPLOYMENT”

section explaining:

1. What backend/database was used
2. How to create the backend project
3. Required environment variables
4. Where to paste API keys
5. How to run the app locally
6. How to deploy it
7. How to create the first birthday game
8. How the 5 phones join
9. How real-time synchronization works
10. How data can be deleted after the event

Do not leave any core feature as a placeholder.

If a backend service cannot be automatically provisioned from this environment, build the complete integration and give me exact setup steps rather than pretending it is functional.

The final result should be a **real, usable multiplayer birthday game**, not merely a Figma mockup.

The overall emotional journey should be:

JOIN → LAUGH → COMPETE → REMEMBER → GET EMOTIONAL → CELEBRATE

The most important goal is that the birthday girl finishes the game feeling:

“Wow. They actually know me.”
and
“Wow. They actually put effort into this.”
