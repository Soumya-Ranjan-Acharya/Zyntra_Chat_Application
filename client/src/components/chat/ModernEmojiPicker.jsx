import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Smile,
  ThumbsUp,
  Laptop,
  PartyPopper,
  Heart,
  Clock,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'smileys', label: 'Smileys', icon: Smile },
  { id: 'people', label: 'Gestures', icon: ThumbsUp },
  { id: 'tech', label: 'Work', icon: Laptop },
  { id: 'celebration', label: 'Food', icon: PartyPopper },
  { id: 'hearts', label: 'Hearts', icon: Heart }
];

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '🎉', '🚀', '👏', '✨', '💯', '💡', '😍', '🙌', '☕', '🤝', '⚡', '👀'];

const EMOJI_DATABASE = [
  // Smileys & Emotion
  { char: '😀', name: 'Grinning Face', keywords: 'happy smile joy grin', category: 'smileys' },
  { char: '😃', name: 'Grinning with Big Eyes', keywords: 'happy smile joy haha', category: 'smileys' },
  { char: '😄', name: 'Grinning with Smiling Eyes', keywords: 'happy joy laugh', category: 'smileys' },
  { char: '😁', name: 'Beaming Face', keywords: 'grin smile excited beaming', category: 'smileys' },
  { char: '😆', name: 'Grinning Squinting Face', keywords: 'haha lol laugh chuckle', category: 'smileys' },
  { char: '😅', name: 'Sweat Smile', keywords: 'phew relief nervous smile sweat', category: 'smileys' },
  { char: '🤣', name: 'ROFL', keywords: 'rofl lol laughing dying funny', category: 'smileys' },
  { char: '😂', name: 'Tears of Joy', keywords: 'crying tears laugh funny lol joy', category: 'smileys' },
  { char: '🙂', name: 'Slightly Smiling Face', keywords: 'smile pleasant calm fine', category: 'smileys' },
  { char: '🙃', name: 'Upside-Down Face', keywords: 'silly sarcastic ironic upside', category: 'smileys' },
  { char: '😉', name: 'Winking Face', keywords: 'wink flirt playful joke secretly', category: 'smileys' },
  { char: '😊', name: 'Smiling Face with Smiling Eyes', keywords: 'blush smile warm proud cozy', category: 'smileys' },
  { char: '😇', name: 'Halo Angel', keywords: 'angel innocent good blessed halo', category: 'smileys' },
  { char: '🥰', name: 'Smiling Face with Hearts', keywords: 'love in love sweet adored crush', category: 'smileys' },
  { char: '😍', name: 'Heart Eyes', keywords: 'love crush admire beautiful gorgeous', category: 'smileys' },
  { char: '🤩', name: 'Star-Struck', keywords: 'stars amazed excited fan dazzling', category: 'smileys' },
  { char: '😘', name: 'Blowing a Kiss', keywords: 'kiss love affection flirt sweet', category: 'smileys' },
  { char: '😋', name: 'Face Savoring Food', keywords: 'yum delicious tasty tongue crave', category: 'smileys' },
  { char: '😛', name: 'Tongue Out', keywords: 'playful silly tongue goofy', category: 'smileys' },
  { char: '😜', name: 'Winking Tongue', keywords: 'crazy wink playful joke tease', category: 'smileys' },
  { char: '🤪', name: 'Zany Face', keywords: 'goofy crazy wild wacky derp', category: 'smileys' },
  { char: '😝', name: 'Squinting Tongue', keywords: 'prank teasing funny lol silly', category: 'smileys' },
  { char: '🤑', name: 'Money-Mouth', keywords: 'rich cash dollar wealthy winning profit', category: 'smileys' },
  { char: '🤗', name: 'Hugging Face', keywords: 'hug warm welcome embrace friendly', category: 'smileys' },
  { char: '🤭', name: 'Hand Over Mouth', keywords: 'oops chuckle giggle secretly teehee', category: 'smileys' },
  { char: '🤫', name: 'Shushing Face', keywords: 'quiet secret hush shh silence silent', category: 'smileys' },
  { char: '🤔', name: 'Thinking Face', keywords: 'think ponder wonder hmm consider query', category: 'smileys' },
  { char: '🤐', name: 'Zipper Mouth', keywords: 'silent secret zipper confidential mute', category: 'smileys' },
  { char: '🤨', name: 'Raised Eyebrow', keywords: 'skeptical distrust doubt really sus', category: 'smileys' },
  { char: '😐', name: 'Neutral Face', keywords: 'meh neutral poker face straight flat', category: 'smileys' },
  { char: '😑', name: 'Expressionless Face', keywords: 'blank unamused unimpressed silent', category: 'smileys' },
  { char: '😶', name: 'Mouthless Face', keywords: 'speechless silent quiet muted speechless', category: 'smileys' },
  { char: '😏', name: 'Smirking Face', keywords: 'smirk smug sly cheeky confident', category: 'smileys' },
  { char: '😒', name: 'Unamused Face', keywords: 'bored displeased annoyed side eye unimpressed', category: 'smileys' },
  { char: '🙄', name: 'Rolling Eyes', keywords: 'eye roll whatever sarcastic dismissive bored', category: 'smileys' },
  { char: '😬', name: 'Grimacing Face', keywords: 'awkward cringe eek nervous tense', category: 'smileys' },
  { char: '🤥', name: 'Lying Face', keywords: 'pinocchio lie fake dishonest cap', category: 'smileys' },
  { char: '😌', name: 'Relieved Face', keywords: 'peaceful calm relaxed content serene', category: 'smileys' },
  { char: '😔', name: 'Pensive Face', keywords: 'sad down reflective sorry regret', category: 'smileys' },
  { char: '😪', name: 'Sleepy Face', keywords: 'tired exhausted sleep rest snot', category: 'smileys' },
  { char: '🤤', name: 'Drooling Face', keywords: 'hungry crave appetizing sleep drool', category: 'smileys' },
  { char: '😴', name: 'Sleeping Face', keywords: 'zzz asleep goodnight night snooze bed', category: 'smileys' },
  { char: '😷', name: 'Face with Mask', keywords: 'sick health covid doctor protect flu', category: 'smileys' },
  { char: '🤒', name: 'Thermometer Face', keywords: 'fever ill unwell disease temp sick', category: 'smileys' },
  { char: '🤕', name: 'Head Bandage', keywords: 'hurt injured head pain hospital ouch', category: 'smileys' },
  { char: '🤢', name: 'Nauseated Face', keywords: 'gross sick disgust green vomit nausea', category: 'smileys' },
  { char: '🤮', name: 'Vomiting Face', keywords: 'puke throw up disgusted barf gross', category: 'smileys' },
  { char: '🤧', name: 'Sneezing Face', keywords: 'achoo cold tissue flu sneeze allergy', category: 'smileys' },
  { char: '🥵', name: 'Hot Face', keywords: 'sweat fever heat summer warm spicy', category: 'smileys' },
  { char: '🥶', name: 'Cold Face', keywords: 'freezing ice winter chill snow frozen', category: 'smileys' },
  { char: '🥴', name: 'Woozy Face', keywords: 'dizzy drunk tipsy unbalanced high', category: 'smileys' },
  { char: '😵', name: 'Dizzy Face', keywords: 'knocked out spiral stunned dead fainting', category: 'smileys' },
  { char: '🤯', name: 'Exploding Head', keywords: 'mind blown shock unbelievable wow holy', category: 'smileys' },
  { char: '🤠', name: 'Cowboy Hat', keywords: 'western wild yeehaw sheriff country', category: 'smileys' },
  { char: '🥳', name: 'Partying Face', keywords: 'party celebration birthday horn woohoo yay', category: 'smileys' },
  { char: '😎', name: 'Cool Sunglasses', keywords: 'cool shades sun awesome boss swag slick', category: 'smileys' },
  { char: '🤓', name: 'Nerd Face', keywords: 'geek smart glasses study code tech nerd', category: 'smileys' },
  { char: '🧐', name: 'Monocle Face', keywords: 'curious inspect classy detective inspect', category: 'smileys' },
  { char: '😕', name: 'Confused Face', keywords: 'puzzled unsure what huh doubt', category: 'smileys' },
  { char: '😟', name: 'Worried Face', keywords: 'anxious concerned uneasy nervous', category: 'smileys' },
  { char: '🙁', name: 'Slightly Frowning', keywords: 'sad unhappy down disappointment glum', category: 'smileys' },
  { char: '😮', name: 'Open Mouth', keywords: 'surprised gasp wow whoa omg', category: 'smileys' },
  { char: '😯', name: 'Hushed Face', keywords: 'stunned quiet startled silence whisper', category: 'smileys' },
  { char: '😲', name: 'Astonished Face', keywords: 'shocked amazement incredible shocked', category: 'smileys' },
  { char: '😳', name: 'Flushed Face', keywords: 'embarrassed blush shy surprised wide eyes', category: 'smileys' },
  { char: '🥺', name: 'Pleading Face', keywords: 'begging puppy eyes please cute mercy pity', category: 'smileys' },
  { char: '😦', name: 'Frowning Open Mouth', keywords: 'shocked dismay distress alarmed', category: 'smileys' },
  { char: '😧', name: 'Anguished Face', keywords: 'pain stressed shocked hurt upset', category: 'smileys' },
  { char: '😨', name: 'Fearful Face', keywords: 'scared fright afraid terrify panic', category: 'smileys' },
  { char: '😰', name: 'Anxious Sweat', keywords: 'nervous worry sweat troubled stressed', category: 'smileys' },
  { char: '😥', name: 'Sad Relieved', keywords: 'close call whew sweat sad phew', category: 'smileys' },
  { char: '😢', name: 'Crying Face', keywords: 'tear sad unhappy upset mourn weep', category: 'smileys' },
  { char: '😭', name: 'Loudly Crying', keywords: 'bawling sob weeping drama devastated upset', category: 'smileys' },
  { char: '😱', name: 'Screaming in Fear', keywords: 'munch scream terror shocked horror scream', category: 'smileys' },
  { char: '😖', name: 'Confounded Face', keywords: 'quivering stressed frustration pain struggle', category: 'smileys' },
  { char: '😣', name: 'Persevering Face', keywords: 'struggle hardship endure trying tough', category: 'smileys' },
  { char: '😞', name: 'Disappointed Face', keywords: 'let down gloom depressed discouraged', category: 'smileys' },
  { char: '😓', name: 'Downcast Sweat', keywords: 'hard work exhausted stress relief sweat', category: 'smileys' },
  { char: '😩', name: 'Weary Face', keywords: 'tired done exhausted fed up frustrated', category: 'smileys' },
  { char: '😫', name: 'Tired Face', keywords: 'overwhelmed exhausted whiny drained', category: 'smileys' },
  { char: '🥱', name: 'Yawning Face', keywords: 'bored sleepy yawn tired dull sleep', category: 'smileys' },
  { char: '😤', name: 'Steam From Nose', keywords: 'triumph proud winning huff fume steam', category: 'smileys' },
  { char: '😡', name: 'Enraged Face', keywords: 'angry mad furious red fume anger', category: 'smileys' },
  { char: '😠', name: 'Angry Face', keywords: 'mad annoyed grumpy pissed upset', category: 'smileys' },
  { char: '🤬', name: 'Cursing Face', keywords: 'swearing cussing furious rage profanity swear', category: 'smileys' },
  { char: '😈', name: 'Smiling Devil', keywords: 'devil evil bad naughty smile grin horned', category: 'smileys' },
  { char: '👿', name: 'Angry Devil', keywords: 'demon devil furious evil mad horned', category: 'smileys' },
  { char: '💀', name: 'Skull', keywords: 'dead dying skeleton laughing lol bone', category: 'smileys' },
  { char: '☠️', name: 'Crossbones Skull', keywords: 'danger poison lethal pirate dead danger', category: 'smileys' },
  { char: '💩', name: 'Poop', keywords: 'poo crap dung funny turd smile', category: 'smileys' },
  { char: '🤡', name: 'Clown', keywords: 'circus funny goofy fool clowning joke', category: 'smileys' },
  { char: '👹', name: 'Ogre Mask', keywords: 'monster japanese mask scary troll devil', category: 'smileys' },
  { char: '👻', name: 'Ghost', keywords: 'spooky halloween spirit haunting boo', category: 'smileys' },
  { char: '👽', name: 'Alien', keywords: 'ufo space extraterrestrial martian et', category: 'smileys' },
  { char: '🤖', name: 'Robot', keywords: 'bot automated tech ai android cyborg machine', category: 'smileys' },

  // Gestures & People
  { char: '👋', name: 'Waving Hand', keywords: 'wave hello hi bye goodbye greeting hey', category: 'people' },
  { char: '🤚', name: 'Raised Back of Hand', keywords: 'backhand stop question volunteer high', category: 'people' },
  { char: '✋', name: 'High Five / Raised Hand', keywords: 'high five stop halt question wait hand', category: 'people' },
  { char: '🖖', name: 'Vulcan Salute', keywords: 'spock star trek live long prosper peace', category: 'people' },
  { char: '👌', name: 'OK Hand', keywords: 'perfect okay fine got it awesome agreed', category: 'people' },
  { char: '🤌', name: 'Pinched Fingers', keywords: 'italian chef kiss what gesture mama mia', category: 'people' },
  { char: '🤏', name: 'Pinching Hand', keywords: 'little tiny bit small fraction small amount', category: 'people' },
  { char: '✌️', name: 'Victory / Peace', keywords: 'peace two win success victory v', category: 'people' },
  { char: '🤞', name: 'Crossed Fingers', keywords: 'luck hope wish promise fingers crossed lucky', category: 'people' },
  { char: '🫰', name: 'Finger Heart', keywords: 'korean heart love snap money kpop', category: 'people' },
  { char: '🤟', name: 'Love-You Sign', keywords: 'ily rock on love sign language hand', category: 'people' },
  { char: '🤘', name: 'Rock On', keywords: 'rock heavy metal concert awesome punk horns', category: 'people' },
  { char: '🤙', name: 'Call Me / Shaka', keywords: 'shaka hang loose call phone surfer chill', category: 'people' },
  { char: '👈', name: 'Point Left', keywords: 'point left direction that look west', category: 'people' },
  { char: '👉', name: 'Point Right', keywords: 'point right direction here check east', category: 'people' },
  { char: '👆', name: 'Point Up', keywords: 'point up top above agree this north', category: 'people' },
  { char: '👇', name: 'Point Down', keywords: 'point down below under read this south', category: 'people' },
  { char: '☝️', name: 'Index Up', keywords: 'one point secret attention first wait listen', category: 'people' },
  { char: '👍', name: 'Thumbs Up', keywords: 'like approve yes good great agree confirm done ok', category: 'people' },
  { char: '👎', name: 'Thumbs Down', keywords: 'dislike disapprove no bad disagree decline fail', category: 'people' },
  { char: '✊', name: 'Raised Fist', keywords: 'power strength protest solid solidarity fight', category: 'people' },
  { char: '👊', name: 'Punch / Fist Bump', keywords: 'punch bro fist bump attack hit respect', category: 'people' },
  { char: '🤛', name: 'Left Fist Bump', keywords: 'fist bump bro pound team support', category: 'people' },
  { char: '🤜', name: 'Right Fist Bump', keywords: 'fist bump bro pound team support', category: 'people' },
  { char: '👏', name: 'Clapping Hands', keywords: 'applause clap bravo well done congrats kudos cheer', category: 'people' },
  { char: '🙌', name: 'Raising Hands', keywords: 'celebrate hooray praise ten hallelujah win blessed', category: 'people' },
  { char: '🫶', name: 'Heart Hands', keywords: 'love heart support kindness sweet care affection', category: 'people' },
  { char: '👐', name: 'Open Hands', keywords: 'open welcome hug jazz hands warm invite', category: 'people' },
  { char: '🤲', name: 'Palms Together', keywords: 'prayer open blessing offer receive hope', category: 'people' },
  { char: '🤝', name: 'Handshake', keywords: 'deal agree partner partnership business contract shook', category: 'people' },
  { char: '🙏', name: 'Pray / Gratitude', keywords: 'please thank you pray gratitude namaste bless thank', category: 'people' },
  { char: '✍️', name: 'Writing Hand', keywords: 'write note pen signing agreement draft author', category: 'people' },
  { char: '💪', name: 'Flexed Biceps', keywords: 'strong muscle workout fitness power flex lift', category: 'people' },
  { char: '🧠', name: 'Brain', keywords: 'smart intelligence mind idea thinking memory genius big brain', category: 'people' },
  { char: '👀', name: 'Eyes', keywords: 'look see watching peep check observation glance attention', category: 'people' },
  { char: '🧑‍💻', name: 'Developer', keywords: 'coder developer engineer programmer hacker tech code', category: 'people' },
  { char: '👩‍💻', name: 'Woman Developer', keywords: 'developer coder programmer girl boss tech code', category: 'people' },
  { char: '👨‍💻', name: 'Man Developer', keywords: 'developer coder programmer engineer tech software', category: 'people' },
  { char: '🕵️', name: 'Detective', keywords: 'spy secret sleuth investigate inspect agent undercover', category: 'people' },
  { char: '🧑‍🚀', name: 'Astronaut', keywords: 'space astronaut cosmos science explorer rocket moon', category: 'people' },

  // Tech & Work / Objects
  { char: '🚀', name: 'Rocket Launch', keywords: 'launch speed space ship fast startup blastoff growth fly', category: 'tech' },
  { char: '💻', name: 'Laptop', keywords: 'computer macbook work code tech pc screen monitor laptop', category: 'tech' },
  { char: '🖥️', name: 'Desktop Monitor', keywords: 'screen workstation pc monitor tech imac display', category: 'tech' },
  { char: '📱', name: 'Smartphone', keywords: 'iphone smartphone android cell call text phone mobile', category: 'tech' },
  { char: '💡', name: 'Idea Light Bulb', keywords: 'idea solution bright creative invent smart insight bulb', category: 'tech' },
  { char: '⚡', name: 'Lightning / Fast', keywords: 'lightning bolt power flash energy instant speed fast electric zap', category: 'tech' },
  { char: '🔥', name: 'Fire / Hot', keywords: 'flame hot lit trend exciting viral fire burning hype', category: 'tech' },
  { char: '💯', name: '100 Percent', keywords: '100 perfect score keep it real score best truth full marks', category: 'tech' },
  { char: '⚙️', name: 'Settings Gear', keywords: 'settings cog config configuration mechanical system engine', category: 'tech' },
  { char: '🛠️', name: 'Hammer & Wrench', keywords: 'tools build fix maintain dev repair setup configure', category: 'tech' },
  { char: '🔧', name: 'Wrench', keywords: 'fix tool setting tighten repair maintenance adjust', category: 'tech' },
  { char: '🔨', name: 'Hammer', keywords: 'tool build construct smash forge hardware hammer', category: 'tech' },
  { char: '🧰', name: 'Toolbox', keywords: 'kit repair gear utility maintenance instruments toolbox', category: 'tech' },
  { char: '🔬', name: 'Microscope', keywords: 'science research lab study experiment inspect deep dive', category: 'tech' },
  { char: '🔭', name: 'Telescope', keywords: 'astronomy space stars explore view zoom vision future', category: 'tech' },
  { char: '📊', name: 'Bar Chart', keywords: 'analytics metrics graph stats growth data presentation chart', category: 'tech' },
  { char: '📈', name: 'Trending Up', keywords: 'growth up bull market profit trend success soar increase', category: 'tech' },
  { char: '📉', name: 'Trending Down', keywords: 'down drop bear loss slump decline falling decrease', category: 'tech' },
  { char: '📅', name: 'Calendar Date', keywords: 'date schedule event plan meeting agenda timetable day', category: 'tech' },
  { char: '📁', name: 'Folder', keywords: 'document directory archive organize files docs folder', category: 'tech' },
  { char: '📂', name: 'Open Folder', keywords: 'directory open documents browse files folder view', category: 'tech' },
  { char: '📄', name: 'Document', keywords: 'document sheet paper report memo invoice contract page', category: 'tech' },
  { char: '📝', name: 'Memo / Note', keywords: 'write note paper pencil draft edit document task', category: 'tech' },
  { char: '📌', name: 'Pin / Bookmark', keywords: 'pin highlight important notice board location bookmark stick', category: 'tech' },
  { char: '📍', name: 'Location Pin', keywords: 'pin map location target spot venue destination marker', category: 'tech' },
  { char: '📎', name: 'Paperclip Attach', keywords: 'attachment file clip link document combine paperclip', category: 'tech' },
  { char: '🔒', name: 'Locked / Secure', keywords: 'secure safe key privacy privacy security password lock', category: 'tech' },
  { char: '🔓', name: 'Unlocked', keywords: 'open accessible release access bypass permission open', category: 'tech' },
  { char: '🔑', name: 'Key / Access', keywords: 'access secret password auth unlock security login api key', category: 'tech' },
  { char: '🛡️', name: 'Shield / Guard', keywords: 'protect security defense safe guard armor secure defend', category: 'tech' },
  { char: '🔋', name: 'Battery', keywords: 'power charge energy full level electric energy power', category: 'tech' },
  { char: '🔌', name: 'Electric Plug', keywords: 'power outlet adapter connect cable charge plugin', category: 'tech' },
  { char: '📦', name: 'Package / Box', keywords: 'box delivery parcel ship package product crate npm release', category: 'tech' },
  { char: '📧', name: 'Email / Message', keywords: 'mail envelope message inbox letter send contact mail', category: 'tech' },
  { char: '🔔', name: 'Notification Bell', keywords: 'notification alert chime alarm reminder ring notify', category: 'tech' },
  { char: '🔕', name: 'Mute Bell', keywords: 'silent mute no notifications quiet do not disturb off', category: 'tech' },
  { char: '🎯', name: 'Bullseye / Target', keywords: 'target goal aim hit accuracy perfect objective focus', category: 'tech' },
  { char: '✨', name: 'Sparkles / AI', keywords: 'magic shiny new stars special glitter awesome sparkle clean', category: 'tech' },
  { char: '⭐', name: 'Favorite Star', keywords: 'favorite star rate rating quality review shine bookmark', category: 'tech' },
  { char: '🌟', name: 'Glowing Star', keywords: 'sparkle radiant highlight champion bright shining award', category: 'tech' },

  // Celebration & Food
  { char: '🎉', name: 'Party Popper', keywords: 'celebration party congrats confetti hooray woohoo event yay', category: 'celebration' },
  { char: '🎊', name: 'Confetti Ball', keywords: 'party celebration congrats festival event joy celebrate', category: 'celebration' },
  { char: '🎈', name: 'Balloon', keywords: 'party birthday celebrate festive inflate color fun', category: 'celebration' },
  { char: '🎂', name: 'Birthday Cake', keywords: 'cake birthday dessert candles celebration sweet bday', category: 'celebration' },
  { char: '🎁', name: 'Gift Box', keywords: 'present gift surprise birthday package reward prize gift', category: 'celebration' },
  { char: '🏆', name: 'Trophy Cup', keywords: 'winner prize cup champion award first success victorious gold', category: 'celebration' },
  { char: '🥇', name: 'Gold Medal', keywords: 'gold medal champion first win award best winner number one', category: 'celebration' },
  { char: '🥈', name: 'Silver Medal', keywords: 'silver medal runner up second award podium second', category: 'celebration' },
  { char: '🥉', name: 'Bronze Medal', keywords: 'bronze medal third place podium third award', category: 'celebration' },
  { char: '🎖️', name: 'Honor Medal', keywords: 'honor badge award service decoration tribute', category: 'celebration' },
  { char: '👑', name: 'Crown', keywords: 'king queen royal leader royalty victory boss majestic king', category: 'celebration' },
  { char: '💎', name: 'Gem Diamond', keywords: 'diamond precious crystal valuable luxury rare gem bling', category: 'celebration' },
  { char: '🪄', name: 'Magic Wand', keywords: 'magic wizard spell trick wonder magical miracle casting', category: 'celebration' },
  { char: '🍻', name: 'Beer Toast', keywords: 'cheers drink beer toast party pub celebrate drinks', category: 'celebration' },
  { char: '🥂', name: 'Champagne Toast', keywords: 'cheers champagne toast celebration party luxury glasses', category: 'celebration' },
  { char: '☕', name: 'Coffee / Tea', keywords: 'coffee tea cafe morning espresso caffeine mug break warm drink', category: 'celebration' },
  { char: '🍕', name: 'Pizza', keywords: 'food slice cheese italian snack dinner fastfood treat', category: 'celebration' },
  { char: '🍔', name: 'Burger', keywords: 'burger fast food beef lunch sandwich tasty meat', category: 'celebration' },
  { char: '🍟', name: 'French Fries', keywords: 'fries potato snack fast food salty crispy snack', category: 'celebration' },
  { char: '🍿', name: 'Popcorn', keywords: 'movie cinema snack snack food film butter watching', category: 'celebration' },
  { char: '🍩', name: 'Doughnut', keywords: 'donut sweet dessert glaze pastry snack bakery sugar', category: 'celebration' },
  { char: '🍪', name: 'Cookie', keywords: 'chocolate chip biscuit sweet dessert treat baking snack', category: 'celebration' },

  // Hearts & Symbols
  { char: '❤️', name: 'Red Heart', keywords: 'love heart romance passionate affection red favorite', category: 'hearts' },
  { char: '🧡', name: 'Orange Heart', keywords: 'love warm friendship orange care autumn', category: 'hearts' },
  { char: '💛', name: 'Yellow Heart', keywords: 'friendship happy sunshine yellow care pure friend', category: 'hearts' },
  { char: '💚', name: 'Green Heart', keywords: 'nature eco green health jealous peace organic', category: 'hearts' },
  { char: '💙', name: 'Blue Heart', keywords: 'trust loyalty blue calm ocean friendship support', category: 'hearts' },
  { char: '💜', name: 'Purple Heart', keywords: 'purple royalty magic vibrant luxury style royal', category: 'hearts' },
  { char: '🖤', name: 'Black Heart', keywords: 'dark gothic sorrow black edge style dark', category: 'hearts' },
  { char: '🤍', name: 'White Heart', keywords: 'pure clean peace white angelic innocent sincere', category: 'hearts' },
  { char: '🤎', name: 'Brown Heart', keywords: 'earth warmth brown cozy comfort chocolate', category: 'hearts' },
  { char: '💔', name: 'Broken Heart', keywords: 'heartbreak sad pain breakup grief mourning hurt broken', category: 'hearts' },
  { char: '❤️‍🔥', name: 'Heart on Fire', keywords: 'burning love passion intense fiery wild desire fire', category: 'hearts' },
  { char: '❤️‍🩹', name: 'Mending Heart', keywords: 'healing recovery better bandage getting well healing', category: 'hearts' },
  { char: '💖', name: 'Sparkling Heart', keywords: 'glitter love sparkle shine radiant affection glow', category: 'hearts' },
  { char: '💗', name: 'Growing Heart', keywords: 'pulse expansion love feelings flutter growing', category: 'hearts' },
  { char: '💓', name: 'Beating Heart', keywords: 'heartbeat love pulse alive romance flutter throb', category: 'hearts' },
  { char: '💞', name: 'Revolving Hearts', keywords: 'hearts circle romance love affection cute spin', category: 'hearts' },
  { char: '💕', name: 'Two Hearts', keywords: 'love couple romance affection sweet feeling cute', category: 'hearts' },
  { char: '✅', name: 'Checkmark Done', keywords: 'check tick done complete verified approve pass correct ok yes', category: 'hearts' },
  { char: '❌', name: 'Cross Error', keywords: 'x no cancel wrong error reject fail false decline stop', category: 'hearts' },
  { char: '⚠️', name: 'Warning Alert', keywords: 'caution alert danger notice heed caution risk hazard warning', category: 'hearts' },
  { char: '🚨', name: 'Siren / Urgent', keywords: 'emergency siren alert alarm red beacon urgent critical incident', category: 'hearts' },
  { char: '💬', name: 'Chat Bubble', keywords: 'message chat speak talk comment discuss dialogue converse', category: 'hearts' },
  { char: '🗨️', name: 'Speech Bubble', keywords: 'chat say comment conversation dialogue talk voice', category: 'hearts' },
  { char: '💭', name: 'Thought Bubble', keywords: 'thinking dream imagine ponder wonder consider idea mind', category: 'hearts' },
  { char: '🌐', name: 'Globe / Web', keywords: 'internet world international web online network global earth', category: 'hearts' },
  { char: '💥', name: 'Explosion / Boom', keywords: 'boom blast explosion pow smash impact dynamic pow', category: 'hearts' },
  { char: '🌈', name: 'Rainbow', keywords: 'colors pride sunshine rain sky hope beautiful bright joy', category: 'hearts' },
  { char: '☀️', name: 'Sun / Daylight', keywords: 'sunny daylight weather bright summer warm sunshine heat', category: 'hearts' },
  { char: '🌙', name: 'Moon / Night', keywords: 'night moon sleep bedtime dark evening crescent lunar', category: 'hearts' },
  { char: '🪐', name: 'Planet Saturn', keywords: 'saturn space astronomy cosmos galaxy orbit world sci-fi', category: 'hearts' }
];

export default function ModernEmojiPicker({ onSelectEmoji, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredEmoji, setHoveredEmoji] = useState(null);
  const searchInputRef = useRef(null);

  // Focus search input automatically on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Filtered list based on search and active tab
  const filteredEmojis = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return EMOJI_DATABASE.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      return (
        item.char.includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.keywords.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, activeCategory]);

  const handleSelect = (emoji) => {
    onSelectEmoji(emoji);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        marginBottom: '10px',
        width: '376px',
        maxHeight: '450px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.18), 0 10px 18px -6px rgba(15, 23, 42, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        fontFamily: 'inherit'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Search Bar */}
      <div
        style={{
          padding: '12px 14px 8px 14px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#ffffff'
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '10px',
              color: '#94a3b8',
              pointerEvents: 'none'
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search all emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '34px',
              padding: '0 32px 0 32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '13px',
              color: '#0f172a',
              outline: 'none',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2px',
            marginTop: '10px',
            paddingBottom: '2px'
          }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                title={cat.label}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  padding: '5px 6px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#2563eb' : '#64748b',
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  flexShrink: 0
                }}
              >
                <Icon size={13} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scrollable Emoji Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '270px',
          padding: '10px 12px'
        }}
      >
        {/* Quick / Frequently Used Section (Shown when on 'all' and no search) */}
        {activeCategory === 'all' && !searchQuery && (
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px'
              }}
            >
              <Clock size={11} color="#94a3b8" />
              Frequently Used
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '4px'
              }}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelect(emoji)}
                  onMouseEnter={() =>
                    setHoveredEmoji({
                      char: emoji,
                      name: EMOJI_DATABASE.find((e) => e.char === emoji)?.name || 'Quick Emoji'
                    })
                  }
                  style={{
                    height: '34px',
                    width: '34px',
                    fontSize: '19px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    background: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Catalog Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10px',
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px'
          }}
        >
          <span>
            {searchQuery
              ? `Results (${filteredEmojis.length})`
              : activeCategory === 'all'
              ? 'All Emojis'
              : CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </span>
        </div>

        {/* Emojis Grid */}
        {filteredEmojis.length === 0 ? (
          <div
            style={{
              padding: '30px 10px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '13px'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>🧐</div>
            No emojis match &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '4px'
            }}
          >
            {filteredEmojis.map((emoji) => (
              <button
                key={`${emoji.category}-${emoji.char}`}
                type="button"
                onClick={() => handleSelect(emoji.char)}
                onMouseEnter={() => setHoveredEmoji(emoji)}
                style={{
                  height: '34px',
                  width: '34px',
                  fontSize: '19px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'scale(1.22)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {emoji.char}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Bottom Preview Footer */}
      <div
        style={{
          padding: '8px 14px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minHeight: '44px',
          boxSizing: 'border-box'
        }}
      >
        {hoveredEmoji ? (
          <>
            <div style={{ fontSize: '26px', lineHeight: 1 }}>{hoveredEmoji.char}</div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1e293b',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {hoveredEmoji.name}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: '#64748b'
                }}
              >
                Click to insert into message
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#94a3b8'
            }}
          >
            <span>✨</span>
            <span>Hover over any emoji for preview</span>
          </div>
        )}
      </div>
    </div>
  );
}
