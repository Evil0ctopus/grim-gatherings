// Committed, standalone count-specific editions. Rebuild only with tools/author-editions.mjs.
export default {
  "3": {
    "schemaVersion": 2,
    "clueRouting": "rotating",
    "title": "Footsteps Above Blackthorn Farm",
    "setting": "Blackthorn Farm, a fictional Alpine foothill settlement, winter 1923. An isolated farm, unexplained footsteps and a stranger nobody can find evoke the unsolved Hinterkaifeck case. This story uses invented people and an invented solution.",
    "intro": "Otto Hartmann has invited a small gathering to Blackthorn Farm to settle its future. He says the proposed sale contains a lie, and tonight he will name it.\n\nFor a week, the household has heard footsteps above the ceiling. Food has gone missing. A fresh track crosses the snow toward the woods, but nobody recalls a visitor.\n\nOtto refuses to abandon the house. \"Someone wants me frightened enough to sign,\" he says. The evening meal is laid out. A blizzard erases the lane behind you.\n\nTonight's 3 guests carry the investigation themselves. Their observations and the records read at the table are public; nobody needs a hidden packet or an extra actor.",
    "victim": {
      "name": "Otto Hartmann",
      "description": "Owner of Blackthorn Farm. Stubborn, suspicious, and about to reject a lucrative land sale."
    },
    "rounds": [
      {
        "title": "Round 1 - The Workshop Door",
        "narration": "By morning, Otto is dead in the workshop. He entered carrying an intact sale map; the map beside him is torn. The side door is unforced. Marta watched a survey coat leave the side door and saw no one else cross the courtyard before Emil arrived.\n\nA brass button lies beside the desk. Adler's survey coat is missing one. Near the workshop, investigators also find a cap and footprints in the snow. The road is blocked by the storm, and no one can leave.",
        "publicText": "Otto enters with an intact map. A coat leaves, the map is torn, a button lies by the desk and the side door is unforced.",
        "hostNotes": "This is the fixed 3-player pilot. Read the narrator's chapter aloud, then let each guest read their assigned clue. Leave time for discussion and accusations before opening the round vote."
      },
      {
        "title": "Round 2 - The Room Above the Beams",
        "narration": "A search of the attic reveals a blanket, a chipped cup and sketches of the farm boundary. A concealed stair leads down toward the surveyor's measuring room. The footsteps above the household were real, but the room has no entrance from outside.\n\nThe cup and blanket are set aside for comparison. A pantry record also shows that food has gone missing. With the storm still blocking the road, the household turns to the objects and the people who knew the house.",
        "publicText": "The stair, cup, blanket and sketches give the attic a human history. Household thefts complicate the intruder rumor.",
        "hostNotes": "This is the fixed 3-player pilot. Read the narrator's chapter aloud, then let each guest read their assigned clue. Leave time for discussion and accusations before opening the round vote."
      },
      {
        "title": "Round 3 - A Spring on the Wrong Side",
        "narration": "Clara brings two maps to the table: the original keeps the north spring within the farm, while the sale copy moves it onto the buyer's land. The contract uses the altered boundary. A ledger entry records a separate payment to the surveyor near the date the copy was made.\n\nOtto had delayed the sale. Beside the maps are the contract, the payment record and a note about the meeting he planned that evening.",
        "publicText": "Compare original and amended boundaries, the contract clause, the surveyor's signature and a separate payment.",
        "hostNotes": "This is the fixed 3-player pilot. Read the narrator's chapter aloud, then let each guest read their assigned clue. Leave time for discussion and accusations before opening the round vote."
      },
      {
        "title": "Round 4 - The Stranger That Was Not New",
        "narration": "Nell checks the tracks against the snowfall and finds they were already there before the storm. The cap came from the household's own spare-clothes basket. Neither object proves that a stranger visited the workshop that night.\n\nMarta's kitchen-window account is checked against the courtyard timeline. Emil's repair record and Clara's preserved map are brought forward with it. The earlier clues can now be compared with the written records.",
        "publicText": "Old tracks and an existing cap weaken the outsider story. Preserving the plan explains Clara's concealment without erasing the workshop evidence.",
        "hostNotes": "This is the fixed 3-player pilot. Read the narrator's chapter aloud, then let each guest read their assigned clue. Leave time for discussion and accusations before opening the round vote."
      },
      {
        "title": "Round 5 - The Button and the Challenge",
        "narration": "Emil confirms that the brass button beside the workshop desk matches the empty place on Adler's coat. Otto's original map carries a note naming the meeting he planned about the changed boundary and payment.\n\nThe ledger, sale copy, repair record and courtyard account are laid out together. The same coat, missing button and disputed map that appeared at the beginning now point back to the workshop.",
        "publicText": "The matching button and confrontation note connect the map fraud to the workshop encounter.",
        "hostNotes": "This is the fixed 3-player pilot. Read the narrator's chapter aloud, then let each guest read their assigned clue. Leave time for discussion and accusations before opening the round vote."
      }
    ],
    "finale": {
      "narration": "Snow presses against the windows, but the tracks inside the house are clearer now. Name Otto's killer and explain why someone needed both a false map and a false intruder.",
      "votePrompt": "Who murdered Otto Hartmann at Blackthorn Farm?"
    },
    "solution": {
      "killerId": "surveyor",
      "explanation": "Leon Adler, the surveyor, killed Otto in the workshop after Otto discovered that Adler had altered the north boundary and accepted a separate payment. The sale copy diverted the spring to the buyer. Marta saw a survey coat leave the workshop and saw no stranger cross the courtyard; Emil's button comparison ties that coat to Adler. Adler had also used the concealed stair to reach the attic, where the cup and sketches tied the supposed haunting to his measuring room. Clara hid the original map to preserve proof, while Marta's food theft explained some of the missing supplies. The cap and old tracks did not establish a new visitor. The paid boundary, workshop timeline and physical button fit Adler together. This is a fictional crime, not an answer to the real Hinterkaifeck case.",
      "revealNarration": "The killer is Leon Adler, the surveyor. He had been paid to change the farm boundary, moving the valuable north spring onto the buyer's land. Otto found the original plan and arranged to confront him that night.\n\nAdler went to the workshop with Otto. Their argument turned to the altered map and the payment. Adler killed Otto there, tore the sale map and left by the side door. Marta watched a survey coat leave, and the button beside the desk matched the missing button on Adler's coat. No stranger crossed the courtyard before Emil arrived.\n\nThe footsteps above the house were part of the deception. Adler knew the concealed stair because Emil had repaired it at his request. The attic cup and boundary sketches came from Adler's measuring room, explaining how someone could move above the household without using an outside entrance. Clara hid the original map to keep the true boundary safe. Marta had taken food, but that explained only the missing supplies. The cap and tracks were already there; they did not prove a stranger was present that night. The route, the altered boundary, the payment and the workshop evidence all lead to Adler."
    },
    "characters": [
      {
        "id": "surveyor",
        "name": "Leon Adler",
        "role": "The Land Surveyor",
        "publicBlurb": "A polished professional who says the farm's boundaries are complicated.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "heir",
              "text": "The dinner account records Otto telling {heir} he would not sign the sale map until he checked the north spring. A second witness saw her leave carrying a rolled plan, but could not tell which boundary it showed."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "The pantry record shows {housekeeper} took food after the household began blaming the footsteps on a visitor. She later admitted taking it for a neighbor, but her silence gave the stranger story room to grow."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "The original plan {heir} kept shows the north spring inside the farm. The sale copy moves it to the buyer instead. Her hidden map looked suspicious, but it preserves the boundary Otto wanted checked."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "{housekeeper}'s kitchen-window account says she saw a survey coat leave and nobody else cross the yard before Emil arrived. The button match supports her account, while her food theft explains only the missing pantry stores."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "Otto's note says {heir} was to bring the original plan to his meeting with the surveyor. The map she hid keeps the spring with the farm, and the note names the boundary dispute—not a plan to steal the land."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "heir",
        "name": "Clara Hartmann",
        "role": "The Reluctant Heir",
        "publicBlurb": "Otto's adult niece wants a future beyond the farm, but also wants a fair sale.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "{housekeeper} says she watched the workshop from the kitchen window until Emil arrived. She saw a survey coat leave but no one else cross the yard. Her account matters, though her earlier threat to resign gives the room reason to check it."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "Emil's repair book says he fixed the concealed stair at {surveyor}'s request. That stair joins the attic to the survey room, despite the surveyor's claim that no one could reach the hidden room."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "{housekeeper}'s account says she brought a chipped cup down from the attic. Its rim matches a cup from the survey room, but she says she found it while searching for missing food and did not know who had used it."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "Emil confirms he repaired the stair for {surveyor} last month. The attic cup matches the survey room, linking the hidden footsteps to a route the surveyor knew and contradicting his claim that the room was unreachable."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "{housekeeper} saw a survey coat leave, and Emil arrived before anyone else crossed the courtyard. The button matches that coat. Her stolen food explains the pantry rumor, but not the workshop exit or the map torn beside Otto."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "housekeeper",
        "name": "Marta Weiss",
        "role": "The Housekeeper",
        "publicBlurb": "You returned after a previous worker left because of the footsteps.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "Marta's kitchen-window account places {surveyor} leaving the workshop after Otto went in with the sale map. A brass button lay by the desk, and one was missing from the survey coat. The cap and tracks first suggested someone else had been there."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "{heir} hid the original plan after Otto questioned the sale copy. That looked like interference until the two maps were compared: the original keeps the spring with the farm, while the sale copy gives it to the buyer."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "The amended boundary bears {surveyor}'s signature and moves the north spring to the buyer. A ledger records a separate payment to the survey office beside the date of the change; the hidden attic sketches use the same survey marks."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "The note on the plan {heir} saved says Otto meant to confront the surveyor that evening. Her original map keeps the spring inside the farm, so hiding it preserved evidence against the false sale rather than concealing a theft."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "The ledger records a payment to {surveyor} for the altered north boundary. Emil matched the workshop button to the survey coat; Marta's account places that coat leaving while no stranger crossed the yard. The payment, hidden stair and meeting note connect the surveyor to Otto's death."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      }
    ],
    "edition": {
      "family": "blackthorn-farm",
      "playerCount": 3,
      "id": "blackthorn-farm-3-players",
      "revision": 2
    },
    "discloseKiller": false
  },
  "4": {
    "schemaVersion": 2,
    "title": "Footsteps Above Blackthorn Farm",
    "setting": "Blackthorn Farm, a fictional Alpine foothill settlement, winter 1923. An isolated farm, unexplained footsteps and a stranger nobody can find evoke the unsolved Hinterkaifeck case. This story uses invented people and an invented solution.",
    "intro": "Otto Hartmann has invited a small gathering to Blackthorn Farm to settle its future. He says the proposed sale contains a lie, and tonight he will name it.\n\nFor a week, the household has heard footsteps above the ceiling. Food has gone missing. A fresh track crosses the snow toward the woods, but nobody recalls a visitor.\n\nOtto refuses to abandon the house. \"Someone wants me frightened enough to sign,\" he says. The evening meal is laid out. A blizzard erases the lane behind you.\n\nTonight's 4 guests carry the investigation themselves. Their observations and the records read at the table are public; nobody needs a hidden packet or an extra actor.",
    "victim": {
      "name": "Otto Hartmann",
      "description": "Owner of Blackthorn Farm. Stubborn, suspicious, and about to reject a lucrative land sale."
    },
    "rounds": [
      {
        "title": "Round 1 - The Workshop Door",
        "narration": "Otto leaves supper carrying an intact sale map. Marta watches from the kitchen window as he enters the workshop. A few minutes later she sees a survey coat leave its side door. She remains at the window until Emil arrives; nobody crosses the courtyard in between. Otto carried the map in intact; it was torn before his body was found. Emil and Marta discover him beside it and raise the alarm.\n\nThe side door is not forced. A brass button lies near the desk; Leon Adler's survey coat is missing one. A stranger's cap rests nearby, while old footprints lead toward the woods. Those objects are clues to compare, not proof that an unknown visitor came tonight.\n\nRead the first accounts. Otto planned to discuss the farm sale, not sign immediately. The blocked road keeps everyone here. Start with the body, door and sequence of movements before turning every household quarrel into murder.\n\n{housekeeper} reads the kitchen-window sequence. {mechanic} reads the discovery account beside the torn map. {surveyor} describes the missing coat button.\nWhat changed between Otto entering and the alarm? In this 4-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Otto enters with an intact map. A coat leaves, the map is torn, a button lies by the desk and the side door is unforced.",
        "hostNotes": "This is the fixed 4-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 2 - The Room Above the Beams",
        "narration": "The attic is searched. A blanket, a chipped cup and boundary sketches show someone has used the hidden room. A concealed stair connects it to the measuring room used by Adler. Emil repaired that stair at Adler's request last month, contradicting Adler's claim that the attic could not be reached.\n\nThe cup matches one from the measuring room; the blanket appeared after Adler's earlier overnight visit. Clara has concealed the original boundary plan. Marta admits taking food for a struggling neighbor. Emil pawned spare parts. Those acts explain missing supplies and fear of dismissal, but not automatically the body in the workshop.\n\nRead the new clues. The apparent haunting has a route and ordinary objects. Who knew the route, and what did the maps above the beams have to do with the sale?\n\n{mechanic} reads the stair-repair account. {housekeeper} compares the chipped cup with the measuring-room cup. {surveyor} lays out the attic sketches.\nWho could use the room above the beams? In this 4-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {mechanic}.\n{heir} leads the comparison concerning {surveyor}.\n{housekeeper} leads the comparison concerning {heir}.\n{mechanic} leads the comparison concerning {housekeeper}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The stair, cup, blanket and sketches give the attic a human history. Household thefts complicate the intruder rumor.",
        "hostNotes": "This is the fixed 4-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 3 - A Spring on the Wrong Side",
        "narration": "Clara lays the original plan beside the amended sale map. The original keeps the valuable north spring within the farm; the amendment moves it into the buyer's control. Adler signed the amended boundary. The sale contract uses that amended map to assign water access.\n\nOtto had delayed the deal because the price made no sense beside the spring's value. The ledger and buyer's correspondence record a separate payment to the surveyor. This was not merely Clara looking for another buyer or a neighbor shifting a pasture fence.\n\nThe family's documents are brought to the table and read in full before the comparison. Read the clues and trace who would gain from the changed map. A financial link must still fit the door, coat and workshop timeline.\n\n{heir} places the two boundaries side by side. {surveyor} reads the water-access clause. {housekeeper} reads the separate survey-payment correspondence.\nWho was paid to change the boundary? In this 4-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Compare original and amended boundaries, the contract clause, the surveyor's signature and a separate payment.",
        "hostNotes": "This is the fixed 4-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 4 - The Stranger That Was Not New",
        "narration": "The footprints near the woods predate tonight's snow. The cap was already in the spare-clothes basket before supper; an account describes Adler taking it earlier. Its presence is no longer reliable proof of a new visitor. No unfamiliar visitor can be placed in the workshop merely by pointing to that old cap.\n\nClara hid the original plan to preserve it, and it now protects the truthful inheritance. Marta's food theft explains some vanished supplies. Emil's stair repair identifies who requested access. None is a newly invented alibi: each explanation concerns an object or action already introduced.\n\nReturn to Marta's window account. No outsider crossed while she watched; a survey coat left before Emil arrived. Read the corrections aloud, but do not declare every liar innocent. Test whose explanation survives the map and timeline together.\n\n{housekeeper} compares the age of the tracks with tonight's snow. {heir} reads the account of the cap before supper. {mechanic} returns to the watched courtyard sequence.\nDoes the stranger story survive the timeline? In this 4-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {mechanic}.\n{heir} leads the comparison concerning {surveyor}.\n{housekeeper} leads the comparison concerning {heir}.\n{mechanic} leads the comparison concerning {housekeeper}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Old tracks and an existing cap weaken the outsider story. Preserving the plan explains Clara's concealment without erasing the workshop evidence.",
        "hostNotes": "This is the fixed 4-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 5 - The Button and the Challenge",
        "narration": "Emil compares the recovered brass button with Adler's coat: the design and missing position match. The coat sighting now has physical corroboration. Otto carried the map in intact; it was torn before his body was found.\n\nOtto's annotation on the original plan says he would confront Adler that evening about the changed boundary and payment. Lay it beside the signed amendment, ledger, repaired stair and cup. The footsteps could have been staged during earlier visits to encourage a quick sale, but Otto investigated instead.\n\nRead every final clue and give the sequence: financial pressure, planned confrontation, workshop presence and an attempted outsider story. A missing part or borrowed name is not enough on its own. Your verdict should connect evidence the entire room has heard.\n\n{mechanic} reads the button-match findings. {heir} reads Otto's confrontation annotation. {housekeeper} returns to the correspondence identifying the amendment.\nWhich financial dispute fits the workshop evidence? In this 4-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The matching button and confrontation note connect the map fraud to the workshop encounter.",
        "hostNotes": "This is the fixed 4-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      }
    ],
    "finale": {
      "narration": "Snow presses against the windows, but the tracks inside the house are clearer now. Name Otto's killer and explain why someone needed both a false map and a false intruder.",
      "votePrompt": "Who murdered Otto Hartmann at Blackthorn Farm?"
    },
    "solution": {
      "killerId": "surveyor",
      "explanation": "Adler killed Otto during the workshop confrontation over the altered boundary and separate survey payment. The original plan, signed amendment, contract and ledger show how the north spring was diverted to the buyer. Otto's note records the intended confrontation. Marta's window account places a survey coat leaving before Emil arrives, with no outsider crossing in between; the recovered button matches Adler's missing coat button. The repaired stair, cup and sketches establish his earlier attic access. An already-present cap and old tracks do not establish a fresh visitor. Household thefts and debts explain red herrings, but Adler alone connects the paid amendment, hidden route and workshop evidence. This is a fictional crime, not an answer to the real Hinterkaifeck case.",
      "revealNarration": "The room returns to the records and observations it heard aloud. The murderer is Leon Adler. No confession is needed: the public evidence tells the story."
    },
    "characters": [
      {
        "id": "surveyor",
        "name": "Leon Adler",
        "role": "The Land Surveyor",
        "publicBlurb": "A polished professional who says the farm's boundaries are complicated.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. After Otto is found, correspondence shows {heir} contacted another buyer without his knowledge. The torn sale map and the inheritance make that action suspicious. Which version of the boundary would actually benefit the heir?"
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {surveyor} brings the case against {mechanic} into the discussion. {mechanic} repaired the concealed attic stair without Otto's approval. That repair created access for the person behind the staged footsteps."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. {heir} wanted a sale and had another buyer in mind, yet the plan she hid differs from the amended one. The question is which boundary would serve her inheritance and which would strip it of the spring."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {surveyor} brings the case against {mechanic} into the discussion. The stair repair by {mechanic} was requested by the surveyor. Otto carried an intact map into the workshop; the later tear and recovered coat button point to a confrontation, not proof that the parts thief caused it."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. {heir} benefits from preserving the true boundary. Hiding the original looked like interference in round 2, but its survival exposes the sale's lie. The confrontation note connects Otto's decision to the paid survey, not to a new scheme by the heir."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "heir",
        "name": "Clara Hartmann",
        "role": "The Reluctant Heir",
        "publicBlurb": "Otto's adult niece wants a future beyond the farm, but also wants a fair sale.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} helps find Otto and reports a coat leaving from the kitchen window. A wage demand records the earlier threat to resign. The same person supplies a useful sighting and has a grievance; test both rather than ignoring either."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {heir} brings the case against {surveyor} into the discussion. Boundary sketches in the attic match the work of {surveyor}. The concealed stair leads from the measuring room, despite the surveyor's claim that the attic was inaccessible."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} found a chipped cup in the attic matching one from the measuring room. Having blamed missing food on a visitor makes that report hard to assess until her own theft is separated from the hidden room."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {heir} brings the case against {surveyor} into the discussion. {surveyor} knew the stair worked because the mechanic repaired it at his request. The cup and blanket link the attic to the measuring room and an earlier visit. That knowledge contradicts the inaccessible-room claim even after the cap and old tracks weaken the outsider theory."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} identifies a survey coat leaving the workshop and no outsider crossing the watched courtyard. Her food theft explains a rumor, not that coat. Compare the sighting with the missing button and the mechanic's arrival."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "housekeeper",
        "name": "Marta Weiss",
        "role": "The Housekeeper",
        "publicBlurb": "You returned after a previous worker left because of the footsteps.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} raises the alarm at the unforced side door. Otto's complaint about pawned spare parts threatens the mechanic's job. Knowledge of the workshop gives access, but the door and button must fit an actual sequence."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {housekeeper} brings the case against {heir} into the discussion. {heir} hid the original boundary plan while the offered map diverted the valuable spring. Concealing the very document needed to check the sale deserves an explanation."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} knew the side door was unforced and the hidden stair worked. Repairing that stair without permission could look like preparing a route until the identity of the person who requested it is considered."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {housekeeper} brings the case against {heir} into the discussion. The plan saved by {heir} keeps the spring inside the farm. Otto's note on it called for confronting the surveyor that evening. The concealed map protects a truthful inheritance rather than the false sale."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} matches the recovered button to the survey coat and remembers an intact map carried into the workshop. The parts theft explains fear of dismissal, while these observations test the route and confrontation described by other evidence."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "mechanic",
        "name": "Emil Rauch",
        "role": "The Farm Mechanic",
        "publicBlurb": "You maintain the equipment and know every awkward corner of the house.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {mechanic} brings the case against {surveyor} into the discussion. {surveyor} is reported leaving the workshop after Otto enters with a map. A brass button lies by the desk and one is missing from the survey coat. Compare the sighting with the recovered object before deciding what happened inside."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {mechanic} brings the case against {housekeeper} into the discussion. {housekeeper} secretly took food, allowing the household to blame an intruder. That deception helped the supposed haunting seem real."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {mechanic} brings the case against {surveyor} into the discussion. {surveyor}'s signature appears on the amended plan that moves the spring. The attic sketches are no longer simply evidence of sleeping in a hidden room: they connect that room to the contested sale."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {mechanic} brings the case against {housekeeper} into the discussion. {housekeeper} remained at the kitchen window until the mechanic arrived and reported no outsider crossing the courtyard. Food theft explains some missing supplies, but the survey coat sighting should be tested against the button."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {mechanic} brings the case against {surveyor} into the discussion. The ledger names {surveyor} as the paid author of the altered north boundary. Otto wrote that he would confront Adler. The recovered brass button matches the survey coat, linking the payment to the workshop encounter. {surveyor} knew the repaired stair, changed the valuable boundary and received a separate payment. Otto's challenge and the coat button place the financial dispute beside the workshop encounter. A stranger's cap cannot account for those connected facts."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      }
    ],
    "edition": {
      "family": "blackthorn-farm",
      "playerCount": 4,
      "id": "blackthorn-farm-4-players",
      "revision": 2
    },
    "discloseKiller": false
  },
  "5": {
    "schemaVersion": 2,
    "title": "Footsteps Above Blackthorn Farm",
    "setting": "Blackthorn Farm, a fictional Alpine foothill settlement, winter 1923. An isolated farm, unexplained footsteps and a stranger nobody can find evoke the unsolved Hinterkaifeck case. This story uses invented people and an invented solution.",
    "intro": "Otto Hartmann has invited a small gathering to Blackthorn Farm to settle its future. He says the proposed sale contains a lie, and tonight he will name it.\n\nFor a week, the household has heard footsteps above the ceiling. Food has gone missing. A fresh track crosses the snow toward the woods, but nobody recalls a visitor.\n\nOtto refuses to abandon the house. \"Someone wants me frightened enough to sign,\" he says. The evening meal is laid out. A blizzard erases the lane behind you.\n\nTonight's 5 guests carry the investigation themselves. Their observations and the records read at the table are public; nobody needs a hidden packet or an extra actor.",
    "victim": {
      "name": "Otto Hartmann",
      "description": "Owner of Blackthorn Farm. Stubborn, suspicious, and about to reject a lucrative land sale."
    },
    "rounds": [
      {
        "title": "Round 1 - The Workshop Door",
        "narration": "Otto leaves supper carrying an intact sale map. Marta watches from the kitchen window as he enters the workshop. A few minutes later she sees a survey coat leave its side door. She remains at the window until Emil arrives; nobody crosses the courtyard in between. Otto carried the map in intact; it was torn before his body was found. Emil and Marta discover him beside it and raise the alarm.\n\nThe side door is not forced. A brass button lies near the desk; Leon Adler's survey coat is missing one. A stranger's cap rests nearby, while old footprints lead toward the woods. Those objects are clues to compare, not proof that an unknown visitor came tonight.\n\nRead the first accounts. Otto planned to discuss the farm sale, not sign immediately. The blocked road keeps everyone here. Start with the body, door and sequence of movements before turning every household quarrel into murder.\n\n{housekeeper} reads the kitchen-window sequence. {mechanic} reads the discovery account beside the torn map. {surveyor} describes the missing coat button.\nWhat changed between Otto entering and the alarm? In this 5-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {neighbor}.\n{neighbor} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Otto enters with an intact map. A coat leaves, the map is torn, a button lies by the desk and the side door is unforced.",
        "hostNotes": "This is the fixed 5-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 2 - The Room Above the Beams",
        "narration": "The attic is searched. A blanket, a chipped cup and boundary sketches show someone has used the hidden room. A concealed stair connects it to the measuring room used by Adler. Emil repaired that stair at Adler's request last month, contradicting Adler's claim that the attic could not be reached.\n\nThe cup matches one from the measuring room; the blanket appeared after Adler's earlier overnight visit. Clara has concealed the original boundary plan. Marta admits taking food for a struggling neighbor. Emil pawned spare parts. Those acts explain missing supplies and fear of dismissal, but not automatically the body in the workshop.\n\nRead the new clues. The apparent haunting has a route and ordinary objects. Who knew the route, and what did the maps above the beams have to do with the sale?\n\n{mechanic} reads the stair-repair account. {housekeeper} compares the chipped cup with the measuring-room cup. {surveyor} lays out the attic sketches.\nWho could use the room above the beams? In this 5-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {housekeeper}.\n{heir} leads the comparison concerning {mechanic}.\n{housekeeper} leads the comparison concerning {neighbor}.\n{mechanic} leads the comparison concerning {surveyor}.\n{neighbor} leads the comparison concerning {heir}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The stair, cup, blanket and sketches give the attic a human history. Household thefts complicate the intruder rumor.",
        "hostNotes": "This is the fixed 5-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 3 - A Spring on the Wrong Side",
        "narration": "Clara lays the original plan beside the amended sale map. The original keeps the valuable north spring within the farm; the amendment moves it into the buyer's control. Adler signed the amended boundary. The sale contract uses that amended map to assign water access.\n\nOtto had delayed the deal because the price made no sense beside the spring's value. The ledger and buyer's correspondence record a separate payment to the surveyor. This was not merely Clara looking for another buyer or a neighbor shifting a pasture fence.\n\nThe family's documents are brought to the table and read in full before the comparison. Read the clues and trace who would gain from the changed map. A financial link must still fit the door, coat and workshop timeline.\n\n{heir} places the two boundaries side by side. {surveyor} reads the water-access clause. {housekeeper} reads the separate survey-payment correspondence.\nWho was paid to change the boundary? In this 5-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {mechanic}.\n{heir} leads the comparison concerning {neighbor}.\n{housekeeper} leads the comparison concerning {surveyor}.\n{mechanic} leads the comparison concerning {heir}.\n{neighbor} leads the comparison concerning {housekeeper}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Compare original and amended boundaries, the contract clause, the surveyor's signature and a separate payment.",
        "hostNotes": "This is the fixed 5-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 4 - The Stranger That Was Not New",
        "narration": "The footprints near the woods predate tonight's snow. The cap was already in the spare-clothes basket before supper; an account describes Adler taking it earlier. Its presence is no longer reliable proof of a new visitor. No unfamiliar visitor can be placed in the workshop merely by pointing to that old cap.\n\nClara hid the original plan to preserve it, and it now protects the truthful inheritance. Marta's food theft explains some vanished supplies. Emil's stair repair identifies who requested access. None is a newly invented alibi: each explanation concerns an object or action already introduced.\n\nReturn to Marta's window account. No outsider crossed while she watched; a survey coat left before Emil arrived. Read the corrections aloud, but do not declare every liar innocent. Test whose explanation survives the map and timeline together.\n\n{neighbor} compares the age of the tracks with tonight's snow. {heir} reads the account of the cap before supper. {mechanic} returns to the watched courtyard sequence.\nDoes the stranger story survive the timeline? In this 5-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {neighbor}.\n{heir} leads the comparison concerning {surveyor}.\n{housekeeper} leads the comparison concerning {heir}.\n{mechanic} leads the comparison concerning {housekeeper}.\n{neighbor} leads the comparison concerning {mechanic}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Old tracks and an existing cap weaken the outsider story. Preserving the plan explains Clara's concealment without erasing the workshop evidence.",
        "hostNotes": "This is the fixed 5-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 5 - The Button and the Challenge",
        "narration": "Emil compares the recovered brass button with Adler's coat: the design and missing position match. The coat sighting now has physical corroboration. Otto carried the map in intact; it was torn before his body was found.\n\nOtto's annotation on the original plan says he would confront Adler that evening about the changed boundary and payment. Lay it beside the signed amendment, ledger, repaired stair and cup. The footsteps could have been staged during earlier visits to encourage a quick sale, but Otto investigated instead.\n\nRead every final clue and give the sequence: financial pressure, planned confrontation, workshop presence and an attempted outsider story. A missing part or borrowed name is not enough on its own. Your verdict should connect evidence the entire room has heard.\n\n{mechanic} reads the button-match findings. {heir} reads Otto's confrontation annotation. {housekeeper} returns to the correspondence identifying the amendment.\nWhich financial dispute fits the workshop evidence? In this 5-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {neighbor}.\n{neighbor} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The matching button and confrontation note connect the map fraud to the workshop encounter.",
        "hostNotes": "This is the fixed 5-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      }
    ],
    "finale": {
      "narration": "Snow presses against the windows, but the tracks inside the house are clearer now. Name Otto's killer and explain why someone needed both a false map and a false intruder.",
      "votePrompt": "Who murdered Otto Hartmann at Blackthorn Farm?"
    },
    "solution": {
      "killerId": "surveyor",
      "explanation": "Adler killed Otto during the workshop confrontation over the altered boundary and separate survey payment. The original plan, signed amendment, contract and ledger show how the north spring was diverted to the buyer. Otto's note records the intended confrontation. Marta's window account places a survey coat leaving before Emil arrives, with no outsider crossing in between; the recovered button matches Adler's missing coat button. The repaired stair, cup and sketches establish his earlier attic access. An already-present cap and old tracks do not establish a fresh visitor. Household thefts and debts explain red herrings, but Adler alone connects the paid amendment, hidden route and workshop evidence. This is a fictional crime, not an answer to the real Hinterkaifeck case.",
      "revealNarration": "The room returns to the records and observations it heard aloud. The murderer is Leon Adler. No confession is needed: the public evidence tells the story."
    },
    "characters": [
      {
        "id": "surveyor",
        "name": "Leon Adler",
        "role": "The Land Surveyor",
        "publicBlurb": "A polished professional who says the farm's boundaries are complicated.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. After Otto is found, correspondence shows {heir} contacted another buyer without his knowledge. The torn sale map and the inheritance make that action suspicious. Which version of the boundary would actually benefit the heir?"
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {surveyor} brings the case against {housekeeper} into the discussion. {housekeeper} secretly took food, allowing the household to blame an intruder. That deception helped the supposed haunting seem real."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {surveyor} brings the case against {mechanic} into the discussion. {mechanic} knew the side door was unforced and the hidden stair worked. Repairing that stair without permission could look like preparing a route until the identity of the person who requested it is considered."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {surveyor} brings the case against {neighbor} into the discussion. The post moved by {neighbor} concerns pasture, not the north spring. The older footprints near the woods predate tonight's snow: the fence dispute does not establish a new intruder."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. {heir} benefits from preserving the true boundary. Hiding the original looked like interference in round 2, but its survival exposes the sale's lie. The confrontation note connects Otto's decision to the paid survey, not to a new scheme by the heir."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "heir",
        "name": "Clara Hartmann",
        "role": "The Reluctant Heir",
        "publicBlurb": "Otto's adult niece wants a future beyond the farm, but also wants a fair sale.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} helps find Otto and reports a coat leaving from the kitchen window. A wage demand records the earlier threat to resign. The same person supplies a useful sighting and has a grievance; test both rather than ignoring either."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {heir} brings the case against {mechanic} into the discussion. {mechanic} repaired the concealed attic stair without Otto's approval. That repair created access for the person behind the staged footsteps."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {heir} brings the case against {neighbor} into the discussion. {neighbor} knew the spring was worth more than the disputed pasture. A moved fence post gives a small example of dishonest boundaries, but it is not automatically the same alteration as the sale map."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {heir} brings the case against {surveyor} into the discussion. {surveyor} knew the stair worked because the mechanic repaired it at his request. The cup and blanket link the attic to the measuring room and an earlier visit. That knowledge contradicts the inaccessible-room claim even after the cap and old tracks weaken the outsider theory."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} identifies a survey coat leaving the workshop and no outsider crossing the watched courtyard. Her food theft explains a rumor, not that coat. Compare the sighting with the missing button and the mechanic's arrival."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "housekeeper",
        "name": "Marta Weiss",
        "role": "The Housekeeper",
        "publicBlurb": "You returned after a previous worker left because of the footsteps.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} raises the alarm at the unforced side door. Otto's complaint about pawned spare parts threatens the mechanic's job. Knowledge of the workshop gives access, but the door and button must fit an actual sequence."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {housekeeper} brings the case against {neighbor} into the discussion. {neighbor} moved a fence post to reach water. A new survey could expose that interference and turn a quiet dispute into a costly one."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {housekeeper} brings the case against {surveyor} into the discussion. {surveyor}'s signature appears on the amended plan that moves the spring. The attic sketches are no longer simply evidence of sleeping in a hidden room: they connect that room to the contested sale."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {housekeeper} brings the case against {heir} into the discussion. The plan saved by {heir} keeps the spring inside the farm. Otto's note on it called for confronting the surveyor that evening. The concealed map protects a truthful inheritance rather than the false sale."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} matches the recovered button to the survey coat and remembers an intact map carried into the workshop. The parts theft explains fear of dismissal, while these observations test the route and confrontation described by other evidence."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "mechanic",
        "name": "Emil Rauch",
        "role": "The Farm Mechanic",
        "publicBlurb": "You maintain the equipment and know every awkward corner of the house.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {mechanic} brings the case against {neighbor} into the discussion. A complaint brought to supper threatens {neighbor} with a lawsuit over the fence. Old tracks lie near that boundary. The dispute supplies a grievance, but establish when the tracks were made before linking them to tonight's body."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {mechanic} brings the case against {surveyor} into the discussion. Boundary sketches in the attic match the work of {surveyor}. The concealed stair leads from the measuring room, despite the surveyor's claim that the attic was inaccessible."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {mechanic} brings the case against {heir} into the discussion. {heir} wanted a sale and had another buyer in mind, yet the plan she hid differs from the amended one. The question is which boundary would serve her inheritance and which would strip it of the spring."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {mechanic} brings the case against {housekeeper} into the discussion. {housekeeper} remained at the kitchen window until the mechanic arrived and reported no outsider crossing the courtyard. Food theft explains some missing supplies, but the survey coat sighting should be tested against the button."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {mechanic} brings the case against {neighbor} into the discussion. {neighbor} had a fence dispute, not the paid amendment diverting the north spring. The old tracks weaken a fresh-outsider theory; familiarity observed near the attic window corroborates building access without proving the neighbor killed Otto."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "neighbor",
        "name": "Greta Baum",
        "role": "The Boundary Neighbor",
        "publicBlurb": "You have argued with Otto about fences for years.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {neighbor} brings the case against {surveyor} into the discussion. {surveyor} is reported leaving the workshop after Otto enters with a map. A brass button lies by the desk and one is missing from the survey coat. Compare the sighting with the recovered object before deciding what happened inside."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {neighbor} brings the case against {heir} into the discussion. {heir} hid the original boundary plan while the offered map diverted the valuable spring. Concealing the very document needed to check the sale deserves an explanation."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {neighbor} brings the case against {housekeeper} into the discussion. {housekeeper} found a chipped cup in the attic matching one from the measuring room. Having blamed missing food on a visitor makes that report hard to assess until her own theft is separated from the hidden room."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {neighbor} brings the case against {mechanic} into the discussion. The stair repair by {mechanic} was requested by the surveyor. Otto carried an intact map into the workshop; the later tear and recovered coat button point to a confrontation, not proof that the parts thief caused it."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {neighbor} brings the case against {surveyor} into the discussion. The ledger names {surveyor} as the paid author of the altered north boundary. Otto wrote that he would confront Adler. The recovered brass button matches the survey coat, linking the payment to the workshop encounter. {surveyor} knew the repaired stair, changed the valuable boundary and received a separate payment. Otto's challenge and the coat button place the financial dispute beside the workshop encounter. A stranger's cap cannot account for those connected facts."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      }
    ],
    "edition": {
      "family": "blackthorn-farm",
      "playerCount": 5,
      "id": "blackthorn-farm-5-players",
      "revision": 1
    },
    "discloseKiller": false
  },
  "6": {
    "schemaVersion": 2,
    "title": "Footsteps Above Blackthorn Farm",
    "setting": "Blackthorn Farm, a fictional Alpine foothill settlement, winter 1923. An isolated farm, unexplained footsteps and a stranger nobody can find evoke the unsolved Hinterkaifeck case. This story uses invented people and an invented solution.",
    "intro": "Otto Hartmann has invited a small gathering to Blackthorn Farm to settle its future. He says the proposed sale contains a lie, and tonight he will name it.\n\nFor a week, the household has heard footsteps above the ceiling. Food has gone missing. A fresh track crosses the snow toward the woods, but nobody recalls a visitor.\n\nOtto refuses to abandon the house. \"Someone wants me frightened enough to sign,\" he says. The evening meal is laid out. A blizzard erases the lane behind you.\n\nTonight's 6 guests carry the investigation themselves. Their observations and the records read at the table are public; nobody needs a hidden packet or an extra actor.",
    "victim": {
      "name": "Otto Hartmann",
      "description": "Owner of Blackthorn Farm. Stubborn, suspicious, and about to reject a lucrative land sale."
    },
    "rounds": [
      {
        "title": "Round 1 - The Workshop Door",
        "narration": "Otto leaves supper carrying an intact sale map. Marta watches from the kitchen window as he enters the workshop. A few minutes later she sees a survey coat leave its side door. She remains at the window until Emil arrives; nobody crosses the courtyard in between. Otto carried the map in intact; it was torn before his body was found. Emil and Marta discover him beside it and raise the alarm.\n\nThe side door is not forced. A brass button lies near the desk; Leon Adler's survey coat is missing one. A stranger's cap rests nearby, while old footprints lead toward the woods. Those objects are clues to compare, not proof that an unknown visitor came tonight.\n\nRead the first accounts. Otto planned to discuss the farm sale, not sign immediately. The blocked road keeps everyone here. Start with the body, door and sequence of movements before turning every household quarrel into murder.\n\n{housekeeper} reads the kitchen-window sequence. {mechanic} reads the discovery account beside the torn map. {surveyor} describes the missing coat button.\nWhat changed between Otto entering and the alarm? In this 6-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {neighbor}.\n{neighbor} leads the comparison concerning {teacher}.\n{teacher} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Otto enters with an intact map. A coat leaves, the map is torn, a button lies by the desk and the side door is unforced.",
        "hostNotes": "This is the fixed 6-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 2 - The Room Above the Beams",
        "narration": "The attic is searched. A blanket, a chipped cup and boundary sketches show someone has used the hidden room. A concealed stair connects it to the measuring room used by Adler. Emil repaired that stair at Adler's request last month, contradicting Adler's claim that the attic could not be reached.\n\nThe cup matches one from the measuring room; the blanket appeared after Adler's earlier overnight visit. Clara has concealed the original boundary plan. Marta admits taking food for a struggling neighbor. Emil pawned spare parts. Those acts explain missing supplies and fear of dismissal, but not automatically the body in the workshop.\n\nRead the new clues. The apparent haunting has a route and ordinary objects. Who knew the route, and what did the maps above the beams have to do with the sale?\n\n{mechanic} reads the stair-repair account. {housekeeper} compares the chipped cup with the measuring-room cup. {surveyor} lays out the attic sketches.\nWho could use the room above the beams? In this 6-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {teacher}.\n{heir} leads the comparison concerning {surveyor}.\n{housekeeper} leads the comparison concerning {heir}.\n{mechanic} leads the comparison concerning {housekeeper}.\n{neighbor} leads the comparison concerning {mechanic}.\n{teacher} leads the comparison concerning {neighbor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The stair, cup, blanket and sketches give the attic a human history. Household thefts complicate the intruder rumor.",
        "hostNotes": "This is the fixed 6-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 3 - A Spring on the Wrong Side",
        "narration": "Clara lays the original plan beside the amended sale map. The original keeps the valuable north spring within the farm; the amendment moves it into the buyer's control. Adler signed the amended boundary. The sale contract uses that amended map to assign water access.\n\nOtto had delayed the deal because the price made no sense beside the spring's value. The ledger and buyer's correspondence record a separate payment to the surveyor. This was not merely Clara looking for another buyer or a neighbor shifting a pasture fence.\n\nThe family's documents are brought to the table and read in full before the comparison. Read the clues and trace who would gain from the changed map. A financial link must still fit the door, coat and workshop timeline.\n\n{heir} places the two boundaries side by side. {teacher} reads the water-access clause. {housekeeper} reads the separate survey-payment correspondence.\nWho was paid to change the boundary? In this 6-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {neighbor}.\n{neighbor} leads the comparison concerning {teacher}.\n{teacher} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Compare original and amended boundaries, the contract clause, the surveyor's signature and a separate payment.",
        "hostNotes": "This is the fixed 6-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 4 - The Stranger That Was Not New",
        "narration": "The footprints near the woods predate tonight's snow. The cap was already in the spare-clothes basket before supper; an account describes Adler taking it earlier. Its presence is no longer reliable proof of a new visitor. No unfamiliar visitor can be placed in the workshop merely by pointing to that old cap.\n\nClara hid the original plan to preserve it, and it now protects the truthful inheritance. Marta's food theft explains some vanished supplies. Emil's stair repair identifies who requested access. None is a newly invented alibi: each explanation concerns an object or action already introduced.\n\nReturn to Marta's window account. No outsider crossed while she watched; a survey coat left before Emil arrived. Read the corrections aloud, but do not declare every liar innocent. Test whose explanation survives the map and timeline together.\n\n{neighbor} compares the age of the tracks with tonight's snow. {heir} reads the account of the cap before supper. {mechanic} returns to the watched courtyard sequence.\nDoes the stranger story survive the timeline? In this 6-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {teacher}.\n{heir} leads the comparison concerning {surveyor}.\n{housekeeper} leads the comparison concerning {heir}.\n{mechanic} leads the comparison concerning {housekeeper}.\n{neighbor} leads the comparison concerning {mechanic}.\n{teacher} leads the comparison concerning {neighbor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Old tracks and an existing cap weaken the outsider story. Preserving the plan explains Clara's concealment without erasing the workshop evidence.",
        "hostNotes": "This is the fixed 6-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 5 - The Button and the Challenge",
        "narration": "Emil compares the recovered brass button with Adler's coat: the design and missing position match. The coat sighting now has physical corroboration. Otto carried the map in intact; it was torn before his body was found.\n\nOtto's annotation on the original plan says he would confront Adler that evening about the changed boundary and payment. Lay it beside the signed amendment, ledger, repaired stair and cup. The footsteps could have been staged during earlier visits to encourage a quick sale, but Otto investigated instead.\n\nRead every final clue and give the sequence: financial pressure, planned confrontation, workshop presence and an attempted outsider story. A missing part or borrowed name is not enough on its own. Your verdict should connect evidence the entire room has heard.\n\n{mechanic} reads the button-match findings. {heir} reads Otto's confrontation annotation. {housekeeper} returns to the correspondence identifying the amendment.\nWhich financial dispute fits the workshop evidence? In this 6-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {neighbor}.\n{neighbor} leads the comparison concerning {teacher}.\n{teacher} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The matching button and confrontation note connect the map fraud to the workshop encounter.",
        "hostNotes": "This is the fixed 6-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      }
    ],
    "finale": {
      "narration": "Snow presses against the windows, but the tracks inside the house are clearer now. Name Otto's killer and explain why someone needed both a false map and a false intruder.",
      "votePrompt": "Who murdered Otto Hartmann at Blackthorn Farm?"
    },
    "solution": {
      "killerId": "surveyor",
      "explanation": "Adler killed Otto during the workshop confrontation over the altered boundary and separate survey payment. The original plan, signed amendment, contract and ledger show how the north spring was diverted to the buyer. Otto's note records the intended confrontation. Marta's window account places a survey coat leaving before Emil arrives, with no outsider crossing in between; the recovered button matches Adler's missing coat button. The repaired stair, cup and sketches establish his earlier attic access. An already-present cap and old tracks do not establish a fresh visitor. Household thefts and debts explain red herrings, but Adler alone connects the paid amendment, hidden route and workshop evidence. This is a fictional crime, not an answer to the real Hinterkaifeck case.",
      "revealNarration": "The room returns to the records and observations it heard aloud. The murderer is Leon Adler. No confession is needed: the public evidence tells the story."
    },
    "characters": [
      {
        "id": "surveyor",
        "name": "Leon Adler",
        "role": "The Land Surveyor",
        "publicBlurb": "A polished professional who says the farm's boundaries are complicated.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. After Otto is found, correspondence shows {heir} contacted another buyer without his knowledge. The torn sale map and the inheritance make that action suspicious. Which version of the boundary would actually benefit the heir?"
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {surveyor} brings the case against {teacher} into the discussion. {teacher} concealed that mistake and borrowed money from the heir. Debts and damaged trust gave the teacher a reason to fear the sale discussion."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. {heir} wanted a sale and had another buyer in mind, yet the plan she hid differs from the amended one. The question is which boundary would serve her inheritance and which would strip it of the spring."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {surveyor} brings the case against {teacher} into the discussion. The clause overlooked by {teacher} follows the amended map. The buyer's separate fee to the surveyor is recorded in correspondence; carelessness is suspicious but does not explain that payment or the workshop button."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. {heir} benefits from preserving the true boundary. Hiding the original looked like interference in round 2, but its survival exposes the sale's lie. The confrontation note connects Otto's decision to the paid survey, not to a new scheme by the heir."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "heir",
        "name": "Clara Hartmann",
        "role": "The Reluctant Heir",
        "publicBlurb": "Otto's adult niece wants a future beyond the farm, but also wants a fair sale.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} helps find Otto and reports a coat leaving from the kitchen window. A wage demand records the earlier threat to resign. The same person supplies a useful sighting and has a grievance; test both rather than ignoring either."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {heir} brings the case against {surveyor} into the discussion. Boundary sketches in the attic match the work of {surveyor}. The concealed stair leads from the measuring room, despite the surveyor's claim that the attic was inaccessible."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} found a chipped cup in the attic matching one from the measuring room. Having blamed missing food on a visitor makes that report hard to assess until her own theft is separated from the hidden room."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {heir} brings the case against {surveyor} into the discussion. {surveyor} knew the stair worked because the mechanic repaired it at his request. The cup and blanket link the attic to the measuring room and an earlier visit. That knowledge contradicts the inaccessible-room claim even after the cap and old tracks weaken the outsider theory."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} identifies a survey coat leaving the workshop and no outsider crossing the watched courtyard. Her food theft explains a rumor, not that coat. Compare the sighting with the missing button and the mechanic's arrival."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "housekeeper",
        "name": "Marta Weiss",
        "role": "The Housekeeper",
        "publicBlurb": "You returned after a previous worker left because of the footsteps.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} raises the alarm at the unforced side door. Otto's complaint about pawned spare parts threatens the mechanic's job. Knowledge of the workshop gives access, but the door and button must fit an actual sequence."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {housekeeper} brings the case against {heir} into the discussion. {heir} hid the original boundary plan while the offered map diverted the valuable spring. Concealing the very document needed to check the sale deserves an explanation."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} knew the side door was unforced and the hidden stair worked. Repairing that stair without permission could look like preparing a route until the identity of the person who requested it is considered."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {housekeeper} brings the case against {heir} into the discussion. The plan saved by {heir} keeps the spring inside the farm. Otto's note on it called for confronting the surveyor that evening. The concealed map protects a truthful inheritance rather than the false sale."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} matches the recovered button to the survey coat and remembers an intact map carried into the workshop. The parts theft explains fear of dismissal, while these observations test the route and confrontation described by other evidence."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "mechanic",
        "name": "Emil Rauch",
        "role": "The Farm Mechanic",
        "publicBlurb": "You maintain the equipment and know every awkward corner of the house.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {mechanic} brings the case against {neighbor} into the discussion. A complaint brought to supper threatens {neighbor} with a lawsuit over the fence. Old tracks lie near that boundary. The dispute supplies a grievance, but establish when the tracks were made before linking them to tonight's body."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {mechanic} brings the case against {housekeeper} into the discussion. {housekeeper} secretly took food, allowing the household to blame an intruder. That deception helped the supposed haunting seem real."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {mechanic} brings the case against {neighbor} into the discussion. {neighbor} knew the spring was worth more than the disputed pasture. A moved fence post gives a small example of dishonest boundaries, but it is not automatically the same alteration as the sale map."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {mechanic} brings the case against {housekeeper} into the discussion. {housekeeper} remained at the kitchen window until the mechanic arrived and reported no outsider crossing the courtyard. Food theft explains some missing supplies, but the survey coat sighting should be tested against the button."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {mechanic} brings the case against {neighbor} into the discussion. {neighbor} had a fence dispute, not the paid amendment diverting the north spring. The old tracks weaken a fresh-outsider theory; familiarity observed near the attic window corroborates building access without proving the neighbor killed Otto."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "neighbor",
        "name": "Greta Baum",
        "role": "The Boundary Neighbor",
        "publicBlurb": "You have argued with Otto about fences for years.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {neighbor} brings the case against {teacher} into the discussion. Otto's marked sale offer challenges the summary written by {teacher}. An important water-access clause was missed. Compare the advice with the amended map rather than assuming every bad explanation was deliberately bought."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {neighbor} brings the case against {mechanic} into the discussion. {mechanic} repaired the concealed attic stair without Otto's approval. That repair created access for the person behind the staged footsteps."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {neighbor} brings the case against {teacher} into the discussion. {teacher} can now explain that the contract assigns spring access using the amended map. Missing that clause made earlier advice damaging even if it was careless rather than bought."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {neighbor} brings the case against {mechanic} into the discussion. The stair repair by {mechanic} was requested by the surveyor. Otto carried an intact map into the workshop; the later tear and recovered coat button point to a confrontation, not proof that the parts thief caused it."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {neighbor} brings the case against {teacher} into the discussion. {teacher}'s mistake helped the offer appear ordinary. The separate survey fee in the buyer's correspondence supplies a different, deliberate incentive. Compare the clause with the original plan before confusing a bad summary with a paid boundary change."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "teacher",
        "name": "Ansel Vogel",
        "role": "The Village Teacher",
        "publicBlurb": "You helped Otto read the small print in the sale offer.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {teacher} brings the case against {surveyor} into the discussion. {surveyor} is reported leaving the workshop after Otto enters with a map. A brass button lies by the desk and one is missing from the survey coat. Compare the sighting with the recovered object before deciding what happened inside."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {teacher} brings the case against {neighbor} into the discussion. {neighbor} moved a fence post to reach water. A new survey could expose that interference and turn a quiet dispute into a costly one."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {teacher} brings the case against {surveyor} into the discussion. {surveyor}'s signature appears on the amended plan that moves the spring. The attic sketches are no longer simply evidence of sleeping in a hidden room: they connect that room to the contested sale."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {teacher} brings the case against {neighbor} into the discussion. The post moved by {neighbor} concerns pasture, not the north spring. The older footprints near the woods predate tonight's snow: the fence dispute does not establish a new intruder."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {teacher} brings the case against {surveyor} into the discussion. The ledger names {surveyor} as the paid author of the altered north boundary. Otto wrote that he would confront Adler. The recovered brass button matches the survey coat, linking the payment to the workshop encounter. {surveyor} knew the repaired stair, changed the valuable boundary and received a separate payment. Otto's challenge and the coat button place the financial dispute beside the workshop encounter. A stranger's cap cannot account for those connected facts."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      }
    ],
    "edition": {
      "family": "blackthorn-farm",
      "playerCount": 6,
      "id": "blackthorn-farm-6-players",
      "revision": 1
    },
    "discloseKiller": false
  },
  "7": {
    "schemaVersion": 2,
    "title": "Footsteps Above Blackthorn Farm",
    "setting": "Blackthorn Farm, a fictional Alpine foothill settlement, winter 1923. An isolated farm, unexplained footsteps and a stranger nobody can find evoke the unsolved Hinterkaifeck case. This story uses invented people and an invented solution.",
    "intro": "Otto Hartmann has invited a small gathering to Blackthorn Farm to settle its future. He says the proposed sale contains a lie, and tonight he will name it.\n\nFor a week, the household has heard footsteps above the ceiling. Food has gone missing. A fresh track crosses the snow toward the woods, but nobody recalls a visitor.\n\nOtto refuses to abandon the house. \"Someone wants me frightened enough to sign,\" he says. The evening meal is laid out. A blizzard erases the lane behind you.\n\nTonight's 7 guests carry the investigation themselves. Their observations and the records read at the table are public; nobody needs a hidden packet or an extra actor.",
    "victim": {
      "name": "Otto Hartmann",
      "description": "Owner of Blackthorn Farm. Stubborn, suspicious, and about to reject a lucrative land sale."
    },
    "rounds": [
      {
        "title": "Round 1 - The Workshop Door",
        "narration": "Otto leaves supper carrying an intact sale map. Marta watches from the kitchen window as he enters the workshop. A few minutes later she sees a survey coat leave its side door. She remains at the window until Emil arrives; nobody crosses the courtyard in between. Otto carried the map in intact; it was torn before his body was found. Emil and Marta discover him beside it and raise the alarm.\n\nThe side door is not forced. A brass button lies near the desk; Leon Adler's survey coat is missing one. A stranger's cap rests nearby, while old footprints lead toward the woods. Those objects are clues to compare, not proof that an unknown visitor came tonight.\n\nRead the first accounts. Otto planned to discuss the farm sale, not sign immediately. The blocked road keeps everyone here. Start with the body, door and sequence of movements before turning every household quarrel into murder.\n\n{housekeeper} reads the kitchen-window sequence. {mechanic} reads the discovery account beside the torn map. {surveyor} describes the missing coat button.\nWhat changed between Otto entering and the alarm? In this 7-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {neighbor}.\n{neighbor} leads the comparison concerning {teacher}.\n{teacher} leads the comparison concerning {postmaster}.\n{postmaster} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Otto enters with an intact map. A coat leaves, the map is torn, a button lies by the desk and the side door is unforced.",
        "hostNotes": "This is the fixed 7-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 2 - The Room Above the Beams",
        "narration": "The attic is searched. A blanket, a chipped cup and boundary sketches show someone has used the hidden room. A concealed stair connects it to the measuring room used by Adler. Emil repaired that stair at Adler's request last month, contradicting Adler's claim that the attic could not be reached.\n\nThe cup matches one from the measuring room; the blanket appeared after Adler's earlier overnight visit. Clara has concealed the original boundary plan. Marta admits taking food for a struggling neighbor. Emil pawned spare parts. Those acts explain missing supplies and fear of dismissal, but not automatically the body in the workshop.\n\nRead the new clues. The apparent haunting has a route and ordinary objects. Who knew the route, and what did the maps above the beams have to do with the sale?\n\n{mechanic} reads the stair-repair account. {housekeeper} compares the chipped cup with the measuring-room cup. {surveyor} lays out the attic sketches.\nWho could use the room above the beams? In this 7-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {housekeeper}.\n{heir} leads the comparison concerning {mechanic}.\n{housekeeper} leads the comparison concerning {neighbor}.\n{mechanic} leads the comparison concerning {teacher}.\n{neighbor} leads the comparison concerning {postmaster}.\n{teacher} leads the comparison concerning {surveyor}.\n{postmaster} leads the comparison concerning {heir}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The stair, cup, blanket and sketches give the attic a human history. Household thefts complicate the intruder rumor.",
        "hostNotes": "This is the fixed 7-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 3 - A Spring on the Wrong Side",
        "narration": "Clara lays the original plan beside the amended sale map. The original keeps the valuable north spring within the farm; the amendment moves it into the buyer's control. Adler signed the amended boundary. The sale contract uses that amended map to assign water access.\n\nOtto had delayed the deal because the price made no sense beside the spring's value. The ledger and buyer's correspondence record a separate payment to the surveyor. This was not merely Clara looking for another buyer or a neighbor shifting a pasture fence.\n\nThe family's documents are brought to the table and read in full before the comparison. Read the clues and trace who would gain from the changed map. A financial link must still fit the door, coat and workshop timeline.\n\n{heir} places the two boundaries side by side. {teacher} reads the water-access clause. {housekeeper} reads the separate survey-payment correspondence.\nWho was paid to change the boundary? In this 7-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {mechanic}.\n{heir} leads the comparison concerning {neighbor}.\n{housekeeper} leads the comparison concerning {teacher}.\n{mechanic} leads the comparison concerning {postmaster}.\n{neighbor} leads the comparison concerning {surveyor}.\n{teacher} leads the comparison concerning {heir}.\n{postmaster} leads the comparison concerning {housekeeper}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Compare original and amended boundaries, the contract clause, the surveyor's signature and a separate payment.",
        "hostNotes": "This is the fixed 7-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 4 - The Stranger That Was Not New",
        "narration": "The footprints near the woods predate tonight's snow. The cap was already in the spare-clothes basket before supper; an account describes Adler taking it earlier. Its presence is no longer reliable proof of a new visitor. No unfamiliar visitor can be placed in the workshop merely by pointing to that old cap.\n\nClara hid the original plan to preserve it, and it now protects the truthful inheritance. Marta's food theft explains some vanished supplies. Emil's stair repair identifies who requested access. None is a newly invented alibi: each explanation concerns an object or action already introduced.\n\nReturn to Marta's window account. No outsider crossed while she watched; a survey coat left before Emil arrived. Read the corrections aloud, but do not declare every liar innocent. Test whose explanation survives the map and timeline together.\n\n{neighbor} compares the age of the tracks with tonight's snow. {heir} reads the account of the cap before supper. {mechanic} returns to the watched courtyard sequence.\nDoes the stranger story survive the timeline? In this 7-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {neighbor}.\n{heir} leads the comparison concerning {teacher}.\n{housekeeper} leads the comparison concerning {postmaster}.\n{mechanic} leads the comparison concerning {surveyor}.\n{neighbor} leads the comparison concerning {heir}.\n{teacher} leads the comparison concerning {housekeeper}.\n{postmaster} leads the comparison concerning {mechanic}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Old tracks and an existing cap weaken the outsider story. Preserving the plan explains Clara's concealment without erasing the workshop evidence.",
        "hostNotes": "This is the fixed 7-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 5 - The Button and the Challenge",
        "narration": "Emil compares the recovered brass button with Adler's coat: the design and missing position match. The coat sighting now has physical corroboration. Otto carried the map in intact; it was torn before his body was found.\n\nOtto's annotation on the original plan says he would confront Adler that evening about the changed boundary and payment. Lay it beside the signed amendment, ledger, repaired stair and cup. The footsteps could have been staged during earlier visits to encourage a quick sale, but Otto investigated instead.\n\nRead every final clue and give the sequence: financial pressure, planned confrontation, workshop presence and an attempted outsider story. A missing part or borrowed name is not enough on its own. Your verdict should connect evidence the entire room has heard.\n\n{mechanic} reads the button-match findings. {heir} reads Otto's confrontation annotation. {postmaster} returns to the correspondence identifying the amendment.\nWhich financial dispute fits the workshop evidence? In this 7-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {teacher}.\n{heir} leads the comparison concerning {postmaster}.\n{housekeeper} leads the comparison concerning {surveyor}.\n{mechanic} leads the comparison concerning {heir}.\n{neighbor} leads the comparison concerning {housekeeper}.\n{teacher} leads the comparison concerning {mechanic}.\n{postmaster} leads the comparison concerning {neighbor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The matching button and confrontation note connect the map fraud to the workshop encounter.",
        "hostNotes": "This is the fixed 7-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      }
    ],
    "finale": {
      "narration": "Snow presses against the windows, but the tracks inside the house are clearer now. Name Otto's killer and explain why someone needed both a false map and a false intruder.",
      "votePrompt": "Who murdered Otto Hartmann at Blackthorn Farm?"
    },
    "solution": {
      "killerId": "surveyor",
      "explanation": "Adler killed Otto during the workshop confrontation over the altered boundary and separate survey payment. The original plan, signed amendment, contract and ledger show how the north spring was diverted to the buyer. Otto's note records the intended confrontation. Marta's window account places a survey coat leaving before Emil arrives, with no outsider crossing in between; the recovered button matches Adler's missing coat button. The repaired stair, cup and sketches establish his earlier attic access. An already-present cap and old tracks do not establish a fresh visitor. Household thefts and debts explain red herrings, but Adler alone connects the paid amendment, hidden route and workshop evidence. This is a fictional crime, not an answer to the real Hinterkaifeck case.",
      "revealNarration": "The room returns to the records and observations it heard aloud. The murderer is Leon Adler. No confession is needed: the public evidence tells the story."
    },
    "characters": [
      {
        "id": "surveyor",
        "name": "Leon Adler",
        "role": "The Land Surveyor",
        "publicBlurb": "A polished professional who says the farm's boundaries are complicated.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. After Otto is found, correspondence shows {heir} contacted another buyer without his knowledge. The torn sale map and the inheritance make that action suspicious. Which version of the boundary would actually benefit the heir?"
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {surveyor} brings the case against {housekeeper} into the discussion. {housekeeper} secretly took food, allowing the household to blame an intruder. That deception helped the supposed haunting seem real."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {surveyor} brings the case against {mechanic} into the discussion. {mechanic} knew the side door was unforced and the hidden stair worked. Repairing that stair without permission could look like preparing a route until the identity of the person who requested it is considered."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {surveyor} brings the case against {neighbor} into the discussion. The post moved by {neighbor} concerns pasture, not the north spring. The older footprints near the woods predate tonight's snow: the fence dispute does not establish a new intruder."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {surveyor} brings the case against {teacher} into the discussion. {teacher}'s mistake helped the offer appear ordinary. The separate survey fee in the buyer's correspondence supplies a different, deliberate incentive. Compare the clause with the original plan before confusing a bad summary with a paid boundary change."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "heir",
        "name": "Clara Hartmann",
        "role": "The Reluctant Heir",
        "publicBlurb": "Otto's adult niece wants a future beyond the farm, but also wants a fair sale.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} helps find Otto and reports a coat leaving from the kitchen window. A wage demand records the earlier threat to resign. The same person supplies a useful sighting and has a grievance; test both rather than ignoring either."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {heir} brings the case against {mechanic} into the discussion. {mechanic} repaired the concealed attic stair without Otto's approval. That repair created access for the person behind the staged footsteps."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {heir} brings the case against {neighbor} into the discussion. {neighbor} knew the spring was worth more than the disputed pasture. A moved fence post gives a small example of dishonest boundaries, but it is not automatically the same alteration as the sale map."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {heir} brings the case against {teacher} into the discussion. The clause overlooked by {teacher} follows the amended map. The buyer's separate fee to the surveyor is recorded in correspondence; carelessness is suspicious but does not explain that payment or the workshop button."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {heir} brings the case against {postmaster} into the discussion. {postmaster} handled a parcel of map paper and an invoice addressed to the surveyor. Opening mail was misconduct, but those contents corroborate authorship rather than implicating a new weapon or visitor."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "housekeeper",
        "name": "Marta Weiss",
        "role": "The Housekeeper",
        "publicBlurb": "You returned after a previous worker left because of the footsteps.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} raises the alarm at the unforced side door. Otto's complaint about pawned spare parts threatens the mechanic's job. Knowledge of the workshop gives access, but the door and button must fit an actual sequence."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {housekeeper} brings the case against {neighbor} into the discussion. {neighbor} moved a fence post to reach water. A new survey could expose that interference and turn a quiet dispute into a costly one."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {housekeeper} brings the case against {teacher} into the discussion. {teacher} can now explain that the contract assigns spring access using the amended map. Missing that clause made earlier advice damaging even if it was careless rather than bought."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {housekeeper} brings the case against {postmaster} into the discussion. The parcel delivered by {postmaster} contained map paper. The amended-map invoice was addressed to the surveyor. Mail interference explains secrecy, while the invoice gives a specific authorship lead."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {housekeeper} brings the case against {surveyor} into the discussion. The ledger names {surveyor} as the paid author of the altered north boundary. Otto wrote that he would confront Adler. The recovered brass button matches the survey coat, linking the payment to the workshop encounter. {surveyor} knew the repaired stair, changed the valuable boundary and received a separate payment. Otto's challenge and the coat button place the financial dispute beside the workshop encounter. A stranger's cap cannot account for those connected facts."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "mechanic",
        "name": "Emil Rauch",
        "role": "The Farm Mechanic",
        "publicBlurb": "You maintain the equipment and know every awkward corner of the house.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {mechanic} brings the case against {neighbor} into the discussion. A complaint brought to supper threatens {neighbor} with a lawsuit over the fence. Old tracks lie near that boundary. The dispute supplies a grievance, but establish when the tracks were made before linking them to tonight's body."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {mechanic} brings the case against {teacher} into the discussion. {teacher} concealed that mistake and borrowed money from the heir. Debts and damaged trust gave the teacher a reason to fear the sale discussion."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {mechanic} brings the case against {postmaster} into the discussion. {postmaster} read the warning to compare maps, then hid the delay. Otto's investigation therefore concerned a real contract problem, not merely fear of footsteps above the ceiling."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {mechanic} brings the case against {surveyor} into the discussion. {surveyor} knew the stair worked because the mechanic repaired it at his request. The cup and blanket link the attic to the measuring room and an earlier visit. That knowledge contradicts the inaccessible-room claim even after the cap and old tracks weaken the outsider theory."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {mechanic} brings the case against {heir} into the discussion. {heir} benefits from preserving the true boundary. Hiding the original looked like interference in round 2, but its survival exposes the sale's lie. The confrontation note connects Otto's decision to the paid survey, not to a new scheme by the heir."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "neighbor",
        "name": "Greta Baum",
        "role": "The Boundary Neighbor",
        "publicBlurb": "You have argued with Otto about fences for years.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {neighbor} brings the case against {teacher} into the discussion. Otto's marked sale offer challenges the summary written by {teacher}. An important water-access clause was missed. Compare the advice with the amended map rather than assuming every bad explanation was deliberately bought."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {neighbor} brings the case against {postmaster} into the discussion. {postmaster} opened and badly resealed a letter warning Otto about the buyer. Withholding that warning could have helped the fraudulent sale proceed."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {neighbor} brings the case against {surveyor} into the discussion. {surveyor}'s signature appears on the amended plan that moves the spring. The attic sketches are no longer simply evidence of sleeping in a hidden room: they connect that room to the contested sale."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {neighbor} brings the case against {heir} into the discussion. The plan saved by {heir} keeps the spring inside the farm. Otto's note on it called for confronting the surveyor that evening. The concealed map protects a truthful inheritance rather than the false sale."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {neighbor} brings the case against {housekeeper} into the discussion. {housekeeper} identifies a survey coat leaving the workshop and no outsider crossing the watched courtyard. Her food theft explains a rumor, not that coat. Compare the sighting with the missing button and the mechanic's arrival."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "teacher",
        "name": "Ansel Vogel",
        "role": "The Village Teacher",
        "publicBlurb": "You helped Otto read the small print in the sale offer.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {teacher} brings the case against {postmaster} into the discussion. {postmaster} brings a delayed parcel before supper and stays at the farm. Its opened wrapping and badly resealed letter invite questions about the delivery. Establish what was actually inside before treating a parcel as a weapon."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {teacher} brings the case against {surveyor} into the discussion. Boundary sketches in the attic match the work of {surveyor}. The concealed stair leads from the measuring room, despite the surveyor's claim that the attic was inaccessible."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {teacher} brings the case against {heir} into the discussion. {heir} wanted a sale and had another buyer in mind, yet the plan she hid differs from the amended one. The question is which boundary would serve her inheritance and which would strip it of the spring."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {teacher} brings the case against {housekeeper} into the discussion. {housekeeper} remained at the kitchen window until the mechanic arrived and reported no outsider crossing the courtyard. Food theft explains some missing supplies, but the survey coat sighting should be tested against the button."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {teacher} brings the case against {mechanic} into the discussion. {mechanic} matches the recovered button to the survey coat and remembers an intact map carried into the workshop. The parts theft explains fear of dismissal, while these observations test the route and confrontation described by other evidence."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "postmaster",
        "name": "Frieda Kern",
        "role": "The Postmaster",
        "publicBlurb": "You brought a delayed parcel through the snow and stayed for supper.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {postmaster} brings the case against {surveyor} into the discussion. {surveyor} is reported leaving the workshop after Otto enters with a map. A brass button lies by the desk and one is missing from the survey coat. Compare the sighting with the recovered object before deciding what happened inside."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {postmaster} brings the case against {heir} into the discussion. {heir} hid the original boundary plan while the offered map diverted the valuable spring. Concealing the very document needed to check the sale deserves an explanation."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {postmaster} brings the case against {housekeeper} into the discussion. {housekeeper} found a chipped cup in the attic matching one from the measuring room. Having blamed missing food on a visitor makes that report hard to assess until her own theft is separated from the hidden room."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {postmaster} brings the case against {mechanic} into the discussion. The stair repair by {mechanic} was requested by the surveyor. Otto carried an intact map into the workshop; the later tear and recovered coat button point to a confrontation, not proof that the parts thief caused it."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {postmaster} brings the case against {neighbor} into the discussion. {neighbor} had a fence dispute, not the paid amendment diverting the north spring. The old tracks weaken a fresh-outsider theory; familiarity observed near the attic window corroborates building access without proving the neighbor killed Otto."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      }
    ],
    "edition": {
      "family": "blackthorn-farm",
      "playerCount": 7,
      "id": "blackthorn-farm-7-players",
      "revision": 1
    },
    "discloseKiller": false
  },
  "8": {
    "schemaVersion": 2,
    "title": "Footsteps Above Blackthorn Farm",
    "setting": "Blackthorn Farm, a fictional Alpine foothill settlement, winter 1923. An isolated farm, unexplained footsteps and a stranger nobody can find evoke the unsolved Hinterkaifeck case. This story uses invented people and an invented solution.",
    "intro": "Otto Hartmann has invited a small gathering to Blackthorn Farm to settle its future. He says the proposed sale contains a lie, and tonight he will name it.\n\nFor a week, the household has heard footsteps above the ceiling. Food has gone missing. A fresh track crosses the snow toward the woods, but nobody recalls a visitor.\n\nOtto refuses to abandon the house. \"Someone wants me frightened enough to sign,\" he says. The evening meal is laid out. A blizzard erases the lane behind you.\n\nTonight's 8 guests carry the investigation themselves. Their observations and the records read at the table are public; nobody needs a hidden packet or an extra actor.",
    "victim": {
      "name": "Otto Hartmann",
      "description": "Owner of Blackthorn Farm. Stubborn, suspicious, and about to reject a lucrative land sale."
    },
    "rounds": [
      {
        "title": "Round 1 - The Workshop Door",
        "narration": "Otto leaves supper carrying an intact sale map. Marta watches from the kitchen window as he enters the workshop. A few minutes later she sees a survey coat leave its side door. She remains at the window until Emil arrives; nobody crosses the courtyard in between. Otto carried the map in intact; it was torn before his body was found. Emil and Marta discover him beside it and raise the alarm.\n\nThe side door is not forced. A brass button lies near the desk; Leon Adler's survey coat is missing one. A stranger's cap rests nearby, while old footprints lead toward the woods. Those objects are clues to compare, not proof that an unknown visitor came tonight.\n\nRead the first accounts. Otto planned to discuss the farm sale, not sign immediately. The blocked road keeps everyone here. Start with the body, door and sequence of movements before turning every household quarrel into murder.\n\n{housekeeper} reads the kitchen-window sequence. {mechanic} reads the discovery account beside the torn map. {surveyor} describes the missing coat button.\nWhat changed between Otto entering and the alarm? In this 8-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {neighbor}.\n{neighbor} leads the comparison concerning {teacher}.\n{teacher} leads the comparison concerning {postmaster}.\n{postmaster} leads the comparison concerning {buyeragent}.\n{buyeragent} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Otto enters with an intact map. A coat leaves, the map is torn, a button lies by the desk and the side door is unforced.",
        "hostNotes": "This is the fixed 8-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 2 - The Room Above the Beams",
        "narration": "The attic is searched. A blanket, a chipped cup and boundary sketches show someone has used the hidden room. A concealed stair connects it to the measuring room used by Adler. Emil repaired that stair at Adler's request last month, contradicting Adler's claim that the attic could not be reached.\n\nThe cup matches one from the measuring room; the blanket appeared after Adler's earlier overnight visit. Clara has concealed the original boundary plan. Marta admits taking food for a struggling neighbor. Emil pawned spare parts. Those acts explain missing supplies and fear of dismissal, but not automatically the body in the workshop.\n\nRead the new clues. The apparent haunting has a route and ordinary objects. Who knew the route, and what did the maps above the beams have to do with the sale?\n\n{mechanic} reads the stair-repair account. {housekeeper} compares the chipped cup with the measuring-room cup. {surveyor} lays out the attic sketches.\nWho could use the room above the beams? In this 8-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {mechanic}.\n{heir} leads the comparison concerning {neighbor}.\n{housekeeper} leads the comparison concerning {teacher}.\n{mechanic} leads the comparison concerning {postmaster}.\n{neighbor} leads the comparison concerning {buyeragent}.\n{teacher} leads the comparison concerning {surveyor}.\n{postmaster} leads the comparison concerning {heir}.\n{buyeragent} leads the comparison concerning {housekeeper}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The stair, cup, blanket and sketches give the attic a human history. Household thefts complicate the intruder rumor.",
        "hostNotes": "This is the fixed 8-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 3 - A Spring on the Wrong Side",
        "narration": "Clara lays the original plan beside the amended sale map. The original keeps the valuable north spring within the farm; the amendment moves it into the buyer's control. Adler signed the amended boundary. The sale contract uses that amended map to assign water access.\n\nOtto had delayed the deal because the price made no sense beside the spring's value. The ledger and buyer's correspondence record a separate payment to the surveyor. This was not merely Clara looking for another buyer or a neighbor shifting a pasture fence.\n\nThe family's documents are brought to the table and read in full before the comparison. Read the clues and trace who would gain from the changed map. A financial link must still fit the door, coat and workshop timeline.\n\n{heir} places the two boundaries side by side. {teacher} reads the water-access clause. {buyeragent} reads the separate survey-payment correspondence.\nWho was paid to change the boundary? In this 8-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {teacher}.\n{heir} leads the comparison concerning {postmaster}.\n{housekeeper} leads the comparison concerning {buyeragent}.\n{mechanic} leads the comparison concerning {surveyor}.\n{neighbor} leads the comparison concerning {heir}.\n{teacher} leads the comparison concerning {housekeeper}.\n{postmaster} leads the comparison concerning {mechanic}.\n{buyeragent} leads the comparison concerning {neighbor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Compare original and amended boundaries, the contract clause, the surveyor's signature and a separate payment.",
        "hostNotes": "This is the fixed 8-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 4 - The Stranger That Was Not New",
        "narration": "The footprints near the woods predate tonight's snow. The cap was already in the spare-clothes basket before supper; an account describes Adler taking it earlier. Its presence is no longer reliable proof of a new visitor. No unfamiliar visitor can be placed in the workshop merely by pointing to that old cap.\n\nClara hid the original plan to preserve it, and it now protects the truthful inheritance. Marta's food theft explains some vanished supplies. Emil's stair repair identifies who requested access. None is a newly invented alibi: each explanation concerns an object or action already introduced.\n\nReturn to Marta's window account. No outsider crossed while she watched; a survey coat left before Emil arrived. Read the corrections aloud, but do not declare every liar innocent. Test whose explanation survives the map and timeline together.\n\n{neighbor} compares the age of the tracks with tonight's snow. {heir} reads the account of the cap before supper. {mechanic} returns to the watched courtyard sequence.\nDoes the stranger story survive the timeline? In this 8-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {buyeragent}.\n{heir} leads the comparison concerning {surveyor}.\n{housekeeper} leads the comparison concerning {heir}.\n{mechanic} leads the comparison concerning {housekeeper}.\n{neighbor} leads the comparison concerning {mechanic}.\n{teacher} leads the comparison concerning {neighbor}.\n{postmaster} leads the comparison concerning {teacher}.\n{buyeragent} leads the comparison concerning {postmaster}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Old tracks and an existing cap weaken the outsider story. Preserving the plan explains Clara's concealment without erasing the workshop evidence.",
        "hostNotes": "This is the fixed 8-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 5 - The Button and the Challenge",
        "narration": "Emil compares the recovered brass button with Adler's coat: the design and missing position match. The coat sighting now has physical corroboration. Otto carried the map in intact; it was torn before his body was found.\n\nOtto's annotation on the original plan says he would confront Adler that evening about the changed boundary and payment. Lay it beside the signed amendment, ledger, repaired stair and cup. The footsteps could have been staged during earlier visits to encourage a quick sale, but Otto investigated instead.\n\nRead every final clue and give the sequence: financial pressure, planned confrontation, workshop presence and an attempted outsider story. A missing part or borrowed name is not enough on its own. Your verdict should connect evidence the entire room has heard.\n\n{mechanic} reads the button-match findings. {heir} reads Otto's confrontation annotation. {postmaster} returns to the correspondence identifying the amendment.\nWhich financial dispute fits the workshop evidence? In this 8-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {neighbor}.\n{neighbor} leads the comparison concerning {teacher}.\n{teacher} leads the comparison concerning {postmaster}.\n{postmaster} leads the comparison concerning {buyeragent}.\n{buyeragent} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The matching button and confrontation note connect the map fraud to the workshop encounter.",
        "hostNotes": "This is the fixed 8-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      }
    ],
    "finale": {
      "narration": "Snow presses against the windows, but the tracks inside the house are clearer now. Name Otto's killer and explain why someone needed both a false map and a false intruder.",
      "votePrompt": "Who murdered Otto Hartmann at Blackthorn Farm?"
    },
    "solution": {
      "killerId": "surveyor",
      "explanation": "Adler killed Otto during the workshop confrontation over the altered boundary and separate survey payment. The original plan, signed amendment, contract and ledger show how the north spring was diverted to the buyer. Otto's note records the intended confrontation. Marta's window account places a survey coat leaving before Emil arrives, with no outsider crossing in between; the recovered button matches Adler's missing coat button. The repaired stair, cup and sketches establish his earlier attic access. An already-present cap and old tracks do not establish a fresh visitor. Household thefts and debts explain red herrings, but Adler alone connects the paid amendment, hidden route and workshop evidence. This is a fictional crime, not an answer to the real Hinterkaifeck case.",
      "revealNarration": "The room returns to the records and observations it heard aloud. The murderer is Leon Adler. No confession is needed: the public evidence tells the story."
    },
    "characters": [
      {
        "id": "surveyor",
        "name": "Leon Adler",
        "role": "The Land Surveyor",
        "publicBlurb": "A polished professional who says the farm's boundaries are complicated.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. After Otto is found, correspondence shows {heir} contacted another buyer without his knowledge. The torn sale map and the inheritance make that action suspicious. Which version of the boundary would actually benefit the heir?"
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {surveyor} brings the case against {mechanic} into the discussion. {mechanic} repaired the concealed attic stair without Otto's approval. That repair created access for the person behind the staged footsteps."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {surveyor} brings the case against {teacher} into the discussion. {teacher} can now explain that the contract assigns spring access using the amended map. Missing that clause made earlier advice damaging even if it was careless rather than bought."
            }
          },
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {surveyor} brings the case against {buyeragent} into the discussion. The letter withheld by {buyeragent} names the surveyor as author of the amendment. The commission explains ambition, but the letter must be compared with the separate survey fee and physical evidence."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. {heir} benefits from preserving the true boundary. Hiding the original looked like interference in round 2, but its survival exposes the sale's lie. The confrontation note connects Otto's decision to the paid survey, not to a new scheme by the heir."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "heir",
        "name": "Clara Hartmann",
        "role": "The Reluctant Heir",
        "publicBlurb": "Otto's adult niece wants a future beyond the farm, but also wants a fair sale.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} helps find Otto and reports a coat leaving from the kitchen window. A wage demand records the earlier threat to resign. The same person supplies a useful sighting and has a grievance; test both rather than ignoring either."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {heir} brings the case against {neighbor} into the discussion. {neighbor} moved a fence post to reach water. A new survey could expose that interference and turn a quiet dispute into a costly one."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {heir} brings the case against {postmaster} into the discussion. {postmaster} read the warning to compare maps, then hid the delay. Otto's investigation therefore concerned a real contract problem, not merely fear of footsteps above the ceiling."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {heir} brings the case against {surveyor} into the discussion. {surveyor} knew the stair worked because the mechanic repaired it at his request. The cup and blanket link the attic to the measuring room and an earlier visit. That knowledge contradicts the inaccessible-room claim even after the cap and old tracks weaken the outsider theory."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} identifies a survey coat leaving the workshop and no outsider crossing the watched courtyard. Her food theft explains a rumor, not that coat. Compare the sighting with the missing button and the mechanic's arrival."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "housekeeper",
        "name": "Marta Weiss",
        "role": "The Housekeeper",
        "publicBlurb": "You returned after a previous worker left because of the footsteps.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} raises the alarm at the unforced side door. Otto's complaint about pawned spare parts threatens the mechanic's job. Knowledge of the workshop gives access, but the door and button must fit an actual sequence."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {housekeeper} brings the case against {teacher} into the discussion. {teacher} concealed that mistake and borrowed money from the heir. Debts and damaged trust gave the teacher a reason to fear the sale discussion."
            }
          },
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {housekeeper} brings the case against {buyeragent} into the discussion. {buyeragent} represented the buyer benefiting from spring access. Pressure for a sale links commercial ambition to the false map, but the person drawing the amendment still needs to be identified."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {housekeeper} brings the case against {heir} into the discussion. The plan saved by {heir} keeps the spring inside the farm. Otto's note on it called for confronting the surveyor that evening. The concealed map protects a truthful inheritance rather than the false sale."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} matches the recovered button to the survey coat and remembers an intact map carried into the workshop. The parts theft explains fear of dismissal, while these observations test the route and confrontation described by other evidence."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "mechanic",
        "name": "Emil Rauch",
        "role": "The Farm Mechanic",
        "publicBlurb": "You maintain the equipment and know every awkward corner of the house.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {mechanic} brings the case against {neighbor} into the discussion. A complaint brought to supper threatens {neighbor} with a lawsuit over the fence. Old tracks lie near that boundary. The dispute supplies a grievance, but establish when the tracks were made before linking them to tonight's body."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {mechanic} brings the case against {postmaster} into the discussion. {postmaster} opened and badly resealed a letter warning Otto about the buyer. Withholding that warning could have helped the fraudulent sale proceed."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {mechanic} brings the case against {surveyor} into the discussion. {surveyor}'s signature appears on the amended plan that moves the spring. The attic sketches are no longer simply evidence of sleeping in a hidden room: they connect that room to the contested sale."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {mechanic} brings the case against {housekeeper} into the discussion. {housekeeper} remained at the kitchen window until the mechanic arrived and reported no outsider crossing the courtyard. Food theft explains some missing supplies, but the survey coat sighting should be tested against the button."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {mechanic} brings the case against {neighbor} into the discussion. {neighbor} had a fence dispute, not the paid amendment diverting the north spring. The old tracks weaken a fresh-outsider theory; familiarity observed near the attic window corroborates building access without proving the neighbor killed Otto."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "neighbor",
        "name": "Greta Baum",
        "role": "The Boundary Neighbor",
        "publicBlurb": "You have argued with Otto about fences for years.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {neighbor} brings the case against {teacher} into the discussion. Otto's marked sale offer challenges the summary written by {teacher}. An important water-access clause was missed. Compare the advice with the amended map rather than assuming every bad explanation was deliberately bought."
            }
          },
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {neighbor} brings the case against {buyeragent} into the discussion. The employer of {buyeragent} would gain control of the spring under the amended map. That direct commercial benefit makes the agent's pressure for a sale troubling."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {neighbor} brings the case against {heir} into the discussion. {heir} wanted a sale and had another buyer in mind, yet the plan she hid differs from the amended one. The question is which boundary would serve her inheritance and which would strip it of the spring."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {neighbor} brings the case against {mechanic} into the discussion. The stair repair by {mechanic} was requested by the surveyor. Otto carried an intact map into the workshop; the later tear and recovered coat button point to a confrontation, not proof that the parts thief caused it."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {neighbor} brings the case against {teacher} into the discussion. {teacher}'s mistake helped the offer appear ordinary. The separate survey fee in the buyer's correspondence supplies a different, deliberate incentive. Compare the clause with the original plan before confusing a bad summary with a paid boundary change."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "teacher",
        "name": "Ansel Vogel",
        "role": "The Village Teacher",
        "publicBlurb": "You helped Otto read the small print in the sale offer.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {teacher} brings the case against {postmaster} into the discussion. {postmaster} brings a delayed parcel before supper and stays at the farm. Its opened wrapping and badly resealed letter invite questions about the delivery. Establish what was actually inside before treating a parcel as a weapon."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {teacher} brings the case against {surveyor} into the discussion. Boundary sketches in the attic match the work of {surveyor}. The concealed stair leads from the measuring room, despite the surveyor's claim that the attic was inaccessible."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {teacher} brings the case against {housekeeper} into the discussion. {housekeeper} found a chipped cup in the attic matching one from the measuring room. Having blamed missing food on a visitor makes that report hard to assess until her own theft is separated from the hidden room."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {teacher} brings the case against {neighbor} into the discussion. The post moved by {neighbor} concerns pasture, not the north spring. The older footprints near the woods predate tonight's snow: the fence dispute does not establish a new intruder."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {teacher} brings the case against {postmaster} into the discussion. {postmaster} handled a parcel of map paper and an invoice addressed to the surveyor. Opening mail was misconduct, but those contents corroborate authorship rather than implicating a new weapon or visitor."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "postmaster",
        "name": "Frieda Kern",
        "role": "The Postmaster",
        "publicBlurb": "You brought a delayed parcel through the snow and stayed for supper.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {postmaster} brings the case against {buyeragent} into the discussion. At supper, {buyeragent} presses for signatures and Otto rejects the deadline. A commission depends on the deal. The recorded refusal supplies an event and a motive; the workshop sighting still needs to identify who confronted Otto."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {postmaster} brings the case against {heir} into the discussion. {heir} hid the original boundary plan while the offered map diverted the valuable spring. Concealing the very document needed to check the sale deserves an explanation."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {postmaster} brings the case against {mechanic} into the discussion. {mechanic} knew the side door was unforced and the hidden stair worked. Repairing that stair without permission could look like preparing a route until the identity of the person who requested it is considered."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {postmaster} brings the case against {teacher} into the discussion. The clause overlooked by {teacher} follows the amended map. The buyer's separate fee to the surveyor is recorded in correspondence; carelessness is suspicious but does not explain that payment or the workshop button."
            }
          },
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {postmaster} brings the case against {buyeragent} into the discussion. {buyeragent}'s employer letter and the separate fee distinguish benefiting from a sale from authoring its fraudulent boundary. The letter names the surveyor; compare that with Otto's ledger and the workshop evidence."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "buyeragent",
        "name": "Kaspar Lenz",
        "role": "The Buyer's Agent",
        "publicBlurb": "You want signatures before the storm ends and prices change.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {buyeragent} brings the case against {surveyor} into the discussion. {surveyor} is reported leaving the workshop after Otto enters with a map. A brass button lies by the desk and one is missing from the survey coat. Compare the sighting with the recovered object before deciding what happened inside."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {buyeragent} brings the case against {housekeeper} into the discussion. {housekeeper} secretly took food, allowing the household to blame an intruder. That deception helped the supposed haunting seem real."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {buyeragent} brings the case against {neighbor} into the discussion. {neighbor} knew the spring was worth more than the disputed pasture. A moved fence post gives a small example of dishonest boundaries, but it is not automatically the same alteration as the sale map."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {buyeragent} brings the case against {postmaster} into the discussion. The parcel delivered by {postmaster} contained map paper. The amended-map invoice was addressed to the surveyor. Mail interference explains secrecy, while the invoice gives a specific authorship lead."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {buyeragent} brings the case against {surveyor} into the discussion. The ledger names {surveyor} as the paid author of the altered north boundary. Otto wrote that he would confront Adler. The recovered brass button matches the survey coat, linking the payment to the workshop encounter. {surveyor} knew the repaired stair, changed the valuable boundary and received a separate payment. Otto's challenge and the coat button place the financial dispute beside the workshop encounter. A stranger's cap cannot account for those connected facts."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      }
    ],
    "edition": {
      "family": "blackthorn-farm",
      "playerCount": 8,
      "id": "blackthorn-farm-8-players",
      "revision": 1
    },
    "discloseKiller": false
  },
  "9": {
    "schemaVersion": 2,
    "title": "Footsteps Above Blackthorn Farm",
    "setting": "Blackthorn Farm, a fictional Alpine foothill settlement, winter 1923. An isolated farm, unexplained footsteps and a stranger nobody can find evoke the unsolved Hinterkaifeck case. This story uses invented people and an invented solution.",
    "intro": "Otto Hartmann has invited a small gathering to Blackthorn Farm to settle its future. He says the proposed sale contains a lie, and tonight he will name it.\n\nFor a week, the household has heard footsteps above the ceiling. Food has gone missing. A fresh track crosses the snow toward the woods, but nobody recalls a visitor.\n\nOtto refuses to abandon the house. \"Someone wants me frightened enough to sign,\" he says. The evening meal is laid out. A blizzard erases the lane behind you.\n\nTonight's 9 guests carry the investigation themselves. Their observations and the records read at the table are public; nobody needs a hidden packet or an extra actor.",
    "victim": {
      "name": "Otto Hartmann",
      "description": "Owner of Blackthorn Farm. Stubborn, suspicious, and about to reject a lucrative land sale."
    },
    "rounds": [
      {
        "title": "Round 1 - The Workshop Door",
        "narration": "Otto leaves supper carrying an intact sale map. Marta watches from the kitchen window as he enters the workshop. A few minutes later she sees a survey coat leave its side door. She remains at the window until Emil arrives; nobody crosses the courtyard in between. Otto carried the map in intact; it was torn before his body was found. Emil and Marta discover him beside it and raise the alarm.\n\nThe side door is not forced. A brass button lies near the desk; Leon Adler's survey coat is missing one. A stranger's cap rests nearby, while old footprints lead toward the woods. Those objects are clues to compare, not proof that an unknown visitor came tonight.\n\nRead the first accounts. Otto planned to discuss the farm sale, not sign immediately. The blocked road keeps everyone here. Start with the body, door and sequence of movements before turning every household quarrel into murder.\n\n{housekeeper} reads the kitchen-window sequence. {mechanic} reads the discovery account beside the torn map. {surveyor} describes the missing coat button.\nWhat changed between Otto entering and the alarm? In this 9-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {heir}.\n{heir} leads the comparison concerning {housekeeper}.\n{housekeeper} leads the comparison concerning {mechanic}.\n{mechanic} leads the comparison concerning {neighbor}.\n{neighbor} leads the comparison concerning {teacher}.\n{teacher} leads the comparison concerning {postmaster}.\n{postmaster} leads the comparison concerning {buyeragent}.\n{buyeragent} leads the comparison concerning {musician}.\n{musician} leads the comparison concerning {surveyor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Otto enters with an intact map. A coat leaves, the map is torn, a button lies by the desk and the side door is unforced.",
        "hostNotes": "This is the fixed 9-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 2 - The Room Above the Beams",
        "narration": "The attic is searched. A blanket, a chipped cup and boundary sketches show someone has used the hidden room. A concealed stair connects it to the measuring room used by Adler. Emil repaired that stair at Adler's request last month, contradicting Adler's claim that the attic could not be reached.\n\nThe cup matches one from the measuring room; the blanket appeared after Adler's earlier overnight visit. Clara has concealed the original boundary plan. Marta admits taking food for a struggling neighbor. Emil pawned spare parts. Those acts explain missing supplies and fear of dismissal, but not automatically the body in the workshop.\n\nRead the new clues. The apparent haunting has a route and ordinary objects. Who knew the route, and what did the maps above the beams have to do with the sale?\n\n{mechanic} reads the stair-repair account. {housekeeper} compares the chipped cup with the measuring-room cup. {surveyor} lays out the attic sketches.\nWho could use the room above the beams? In this 9-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {housekeeper}.\n{heir} leads the comparison concerning {mechanic}.\n{housekeeper} leads the comparison concerning {neighbor}.\n{mechanic} leads the comparison concerning {teacher}.\n{neighbor} leads the comparison concerning {postmaster}.\n{teacher} leads the comparison concerning {buyeragent}.\n{postmaster} leads the comparison concerning {musician}.\n{buyeragent} leads the comparison concerning {surveyor}.\n{musician} leads the comparison concerning {heir}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The stair, cup, blanket and sketches give the attic a human history. Household thefts complicate the intruder rumor.",
        "hostNotes": "This is the fixed 9-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 3 - A Spring on the Wrong Side",
        "narration": "Clara lays the original plan beside the amended sale map. The original keeps the valuable north spring within the farm; the amendment moves it into the buyer's control. Adler signed the amended boundary. The sale contract uses that amended map to assign water access.\n\nOtto had delayed the deal because the price made no sense beside the spring's value. The ledger and buyer's correspondence record a separate payment to the surveyor. This was not merely Clara looking for another buyer or a neighbor shifting a pasture fence.\n\nThe family's documents are brought to the table and read in full before the comparison. Read the clues and trace who would gain from the changed map. A financial link must still fit the door, coat and workshop timeline.\n\n{heir} places the two boundaries side by side. {teacher} reads the water-access clause. {buyeragent} reads the separate survey-payment correspondence.\nWho was paid to change the boundary? In this 9-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {neighbor}.\n{heir} leads the comparison concerning {teacher}.\n{housekeeper} leads the comparison concerning {postmaster}.\n{mechanic} leads the comparison concerning {buyeragent}.\n{neighbor} leads the comparison concerning {musician}.\n{teacher} leads the comparison concerning {surveyor}.\n{postmaster} leads the comparison concerning {heir}.\n{buyeragent} leads the comparison concerning {housekeeper}.\n{musician} leads the comparison concerning {mechanic}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Compare original and amended boundaries, the contract clause, the surveyor's signature and a separate payment.",
        "hostNotes": "This is the fixed 9-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 4 - The Stranger That Was Not New",
        "narration": "The footprints near the woods predate tonight's snow. The cap was already in the spare-clothes basket before supper; an account describes Adler taking it earlier. Its presence is no longer reliable proof of a new visitor. The musician explains the borrowed surname; it cannot make an old cap evidence of a new visitor.\n\nClara hid the original plan to preserve it, and it now protects the truthful inheritance. Marta's food theft explains some vanished supplies. Emil's stair repair identifies who requested access. None is a newly invented alibi: each explanation concerns an object or action already introduced.\n\nReturn to Marta's window account. No outsider crossed while she watched; a survey coat left before Emil arrived. Read the corrections aloud, but do not declare every liar innocent. Test whose explanation survives the map and timeline together.\n\n{neighbor} compares the age of the tracks with tonight's snow. {musician} reads the account of the cap before supper. {mechanic} returns to the watched courtyard sequence.\nDoes the stranger story survive the timeline? In this 9-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {teacher}.\n{heir} leads the comparison concerning {postmaster}.\n{housekeeper} leads the comparison concerning {buyeragent}.\n{mechanic} leads the comparison concerning {musician}.\n{neighbor} leads the comparison concerning {surveyor}.\n{teacher} leads the comparison concerning {heir}.\n{postmaster} leads the comparison concerning {housekeeper}.\n{buyeragent} leads the comparison concerning {mechanic}.\n{musician} leads the comparison concerning {neighbor}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "Old tracks and an existing cap weaken the outsider story. Preserving the plan explains Clara's concealment without erasing the workshop evidence.",
        "hostNotes": "This is the fixed 9-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      },
      {
        "title": "Round 5 - The Button and the Challenge",
        "narration": "Emil compares the recovered brass button with Adler's coat: the design and missing position match. The coat sighting now has physical corroboration. Otto carried the map in intact; it was torn before his body was found.\n\nOtto's annotation on the original plan says he would confront Adler that evening about the changed boundary and payment. Lay it beside the signed amendment, ledger, repaired stair and cup. The footsteps could have been staged during earlier visits to encourage a quick sale, but Otto investigated instead.\n\nRead every final clue and give the sequence: financial pressure, planned confrontation, workshop presence and an attempted outsider story. A missing part or borrowed name is not enough on its own. Your verdict should connect evidence the entire room has heard.\n\n{mechanic} reads the button-match findings. {heir} reads Otto's confrontation annotation. {postmaster} returns to the correspondence identifying the amendment.\nWhich financial dispute fits the workshop evidence? In this 9-player edition, the comparison passes through the whole table:\n{surveyor} leads the comparison concerning {buyeragent}.\n{heir} leads the comparison concerning {musician}.\n{housekeeper} leads the comparison concerning {surveyor}.\n{mechanic} leads the comparison concerning {heir}.\n{neighbor} leads the comparison concerning {housekeeper}.\n{teacher} leads the comparison concerning {mechanic}.\n{postmaster} leads the comparison concerning {neighbor}.\n{buyeragent} leads the comparison concerning {teacher}.\n{musician} leads the comparison concerning {postmaster}.\nEvery guest reads the findings below on their phone; nobody acts out a discovery.",
        "publicText": "The matching button and confrontation note connect the map fraud to the workshop encounter.",
        "hostNotes": "This is the fixed 9-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects."
      }
    ],
    "finale": {
      "narration": "Snow presses against the windows, but the tracks inside the house are clearer now. Name Otto's killer and explain why someone needed both a false map and a false intruder.",
      "votePrompt": "Who murdered Otto Hartmann at Blackthorn Farm?"
    },
    "solution": {
      "killerId": "surveyor",
      "explanation": "Adler killed Otto during the workshop confrontation over the altered boundary and separate survey payment. The original plan, signed amendment, contract and ledger show how the north spring was diverted to the buyer. Otto's note records the intended confrontation. Marta's window account places a survey coat leaving before Emil arrives, with no outsider crossing in between; the recovered button matches Adler's missing coat button. The repaired stair, cup and sketches establish his earlier attic access. An already-present cap and old tracks do not establish a fresh visitor. Household thefts and debts explain red herrings, but Adler alone connects the paid amendment, hidden route and workshop evidence. This is a fictional crime, not an answer to the real Hinterkaifeck case.",
      "revealNarration": "The room returns to the records and observations it heard aloud. The murderer is Leon Adler. No confession is needed: the public evidence tells the story."
    },
    "characters": [
      {
        "id": "surveyor",
        "name": "Leon Adler",
        "role": "The Land Surveyor",
        "publicBlurb": "A polished professional who says the farm's boundaries are complicated.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {surveyor} brings the case against {heir} into the discussion. After Otto is found, correspondence shows {heir} contacted another buyer without his knowledge. The torn sale map and the inheritance make that action suspicious. Which version of the boundary would actually benefit the heir?"
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {surveyor} brings the case against {housekeeper} into the discussion. {housekeeper} secretly took food, allowing the household to blame an intruder. That deception helped the supposed haunting seem real."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {surveyor} brings the case against {neighbor} into the discussion. {neighbor} knew the spring was worth more than the disputed pasture. A moved fence post gives a small example of dishonest boundaries, but it is not automatically the same alteration as the sale map."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {surveyor} brings the case against {teacher} into the discussion. The clause overlooked by {teacher} follows the amended map. The buyer's separate fee to the surveyor is recorded in correspondence; carelessness is suspicious but does not explain that payment or the workshop button."
            }
          },
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {surveyor} brings the case against {buyeragent} into the discussion. {buyeragent}'s employer letter and the separate fee distinguish benefiting from a sale from authoring its fraudulent boundary. The letter names the surveyor; compare that with Otto's ledger and the workshop evidence."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "heir",
        "name": "Clara Hartmann",
        "role": "The Reluctant Heir",
        "publicBlurb": "Otto's adult niece wants a future beyond the farm, but also wants a fair sale.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {heir} brings the case against {housekeeper} into the discussion. {housekeeper} helps find Otto and reports a coat leaving from the kitchen window. A wage demand records the earlier threat to resign. The same person supplies a useful sighting and has a grievance; test both rather than ignoring either."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {heir} brings the case against {mechanic} into the discussion. {mechanic} repaired the concealed attic stair without Otto's approval. That repair created access for the person behind the staged footsteps."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {heir} brings the case against {teacher} into the discussion. {teacher} can now explain that the contract assigns spring access using the amended map. Missing that clause made earlier advice damaging even if it was careless rather than bought."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {heir} brings the case against {postmaster} into the discussion. The parcel delivered by {postmaster} contained map paper. The amended-map invoice was addressed to the surveyor. Mail interference explains secrecy, while the invoice gives a specific authorship lead."
            }
          },
          {
            "readAloud": {
              "accuses": "musician",
              "text": "At the evidence table, {heir} brings the case against {musician} into the discussion. {musician} escaped a creditor by changing names. The cap predated supper and was taken from the basket by the surveyor. Those corrections remove the supposed physical link to a stranger without declaring the musician's debt honest."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "housekeeper",
        "name": "Marta Weiss",
        "role": "The Housekeeper",
        "publicBlurb": "You returned after a previous worker left because of the footsteps.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {housekeeper} brings the case against {mechanic} into the discussion. {mechanic} raises the alarm at the unforced side door. Otto's complaint about pawned spare parts threatens the mechanic's job. Knowledge of the workshop gives access, but the door and button must fit an actual sequence."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {housekeeper} brings the case against {neighbor} into the discussion. {neighbor} moved a fence post to reach water. A new survey could expose that interference and turn a quiet dispute into a costly one."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {housekeeper} brings the case against {postmaster} into the discussion. {postmaster} read the warning to compare maps, then hid the delay. Otto's investigation therefore concerned a real contract problem, not merely fear of footsteps above the ceiling."
            }
          },
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {housekeeper} brings the case against {buyeragent} into the discussion. The letter withheld by {buyeragent} names the surveyor as author of the amendment. The commission explains ambition, but the letter must be compared with the separate survey fee and physical evidence."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {housekeeper} brings the case against {surveyor} into the discussion. The ledger names {surveyor} as the paid author of the altered north boundary. Otto wrote that he would confront Adler. The recovered brass button matches the survey coat, linking the payment to the workshop encounter. {surveyor} knew the repaired stair, changed the valuable boundary and received a separate payment. Otto's challenge and the coat button place the financial dispute beside the workshop encounter. A stranger's cap cannot account for those connected facts."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "mechanic",
        "name": "Emil Rauch",
        "role": "The Farm Mechanic",
        "publicBlurb": "You maintain the equipment and know every awkward corner of the house.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {mechanic} brings the case against {neighbor} into the discussion. A complaint brought to supper threatens {neighbor} with a lawsuit over the fence. Old tracks lie near that boundary. The dispute supplies a grievance, but establish when the tracks were made before linking them to tonight's body."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {mechanic} brings the case against {teacher} into the discussion. {teacher} concealed that mistake and borrowed money from the heir. Debts and damaged trust gave the teacher a reason to fear the sale discussion."
            }
          },
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {mechanic} brings the case against {buyeragent} into the discussion. {buyeragent} represented the buyer benefiting from spring access. Pressure for a sale links commercial ambition to the false map, but the person drawing the amendment still needs to be identified."
            }
          },
          {
            "readAloud": {
              "accuses": "musician",
              "text": "At the evidence table, {mechanic} brings the case against {musician} into the discussion. The cap associated with suspicion of {musician} was already in the farm's spare-clothes basket. The musician recalls the surveyor removing it earlier; a false name alone does not explain the altered map."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {mechanic} brings the case against {heir} into the discussion. {heir} benefits from preserving the true boundary. Hiding the original looked like interference in round 2, but its survival exposes the sale's lie. The confrontation note connects Otto's decision to the paid survey, not to a new scheme by the heir."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "neighbor",
        "name": "Greta Baum",
        "role": "The Boundary Neighbor",
        "publicBlurb": "You have argued with Otto about fences for years.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {neighbor} brings the case against {teacher} into the discussion. Otto's marked sale offer challenges the summary written by {teacher}. An important water-access clause was missed. Compare the advice with the amended map rather than assuming every bad explanation was deliberately bought."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {neighbor} brings the case against {postmaster} into the discussion. {postmaster} opened and badly resealed a letter warning Otto about the buyer. Withholding that warning could have helped the fraudulent sale proceed."
            }
          },
          {
            "readAloud": {
              "accuses": "musician",
              "text": "At the evidence table, {neighbor} brings the case against {musician} into the discussion. {musician} heard ordinary movement above the measuring room. An unfamiliar guest using a borrowed surname had made those sounds seem like an outsider's story, even though the room and stairs belonged to the farm."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {neighbor} brings the case against {surveyor} into the discussion. {surveyor} knew the stair worked because the mechanic repaired it at his request. The cup and blanket link the attic to the measuring room and an earlier visit. That knowledge contradicts the inaccessible-room claim even after the cap and old tracks weaken the outsider theory."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {neighbor} brings the case against {housekeeper} into the discussion. {housekeeper} identifies a survey coat leaving the workshop and no outsider crossing the watched courtyard. Her food theft explains a rumor, not that coat. Compare the sighting with the missing button and the mechanic's arrival."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "teacher",
        "name": "Ansel Vogel",
        "role": "The Village Teacher",
        "publicBlurb": "You helped Otto read the small print in the sale offer.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {teacher} brings the case against {postmaster} into the discussion. {postmaster} brings a delayed parcel before supper and stays at the farm. Its opened wrapping and badly resealed letter invite questions about the delivery. Establish what was actually inside before treating a parcel as a weapon."
            }
          },
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {teacher} brings the case against {buyeragent} into the discussion. The employer of {buyeragent} would gain control of the spring under the amended map. That direct commercial benefit makes the agent's pressure for a sale troubling."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {teacher} brings the case against {surveyor} into the discussion. {surveyor}'s signature appears on the amended plan that moves the spring. The attic sketches are no longer simply evidence of sleeping in a hidden room: they connect that room to the contested sale."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {teacher} brings the case against {heir} into the discussion. The plan saved by {heir} keeps the spring inside the farm. Otto's note on it called for confronting the surveyor that evening. The concealed map protects a truthful inheritance rather than the false sale."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {teacher} brings the case against {mechanic} into the discussion. {mechanic} matches the recovered button to the survey coat and remembers an intact map carried into the workshop. The parts theft explains fear of dismissal, while these observations test the route and confrontation described by other evidence."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "postmaster",
        "name": "Frieda Kern",
        "role": "The Postmaster",
        "publicBlurb": "You brought a delayed parcel through the snow and stayed for supper.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "buyeragent",
              "text": "At the evidence table, {postmaster} brings the case against {buyeragent} into the discussion. At supper, {buyeragent} presses for signatures and Otto rejects the deadline. A commission depends on the deal. The recorded refusal supplies an event and a motive; the workshop sighting still needs to identify who confronted Otto."
            }
          },
          {
            "readAloud": {
              "accuses": "musician",
              "text": "At the evidence table, {postmaster} brings the case against {musician} into the discussion. {musician} changed names to escape a debt. Hiding that history makes the account of being stranded worth checking."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {postmaster} brings the case against {heir} into the discussion. {heir} wanted a sale and had another buyer in mind, yet the plan she hid differs from the amended one. The question is which boundary would serve her inheritance and which would strip it of the spring."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {postmaster} brings the case against {housekeeper} into the discussion. {housekeeper} remained at the kitchen window until the mechanic arrived and reported no outsider crossing the courtyard. Food theft explains some missing supplies, but the survey coat sighting should be tested against the button."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {postmaster} brings the case against {neighbor} into the discussion. {neighbor} had a fence dispute, not the paid amendment diverting the north spring. The old tracks weaken a fresh-outsider theory; familiarity observed near the attic window corroborates building access without proving the neighbor killed Otto."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "buyeragent",
        "name": "Kaspar Lenz",
        "role": "The Buyer's Agent",
        "publicBlurb": "You want signatures before the storm ends and prices change.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "musician",
              "text": "At the evidence table, {buyeragent} brings the case against {musician} into the discussion. The cap beside the workshop is associated with suspicion of {musician}, the unfamiliar guest. A borrowed surname adds unease. Establish whether the cap belongs to that guest and whether it was already in the house before tonight."
            }
          },
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {buyeragent} brings the case against {surveyor} into the discussion. Boundary sketches in the attic match the work of {surveyor}. The concealed stair leads from the measuring room, despite the surveyor's claim that the attic was inaccessible."
            }
          },
          {
            "readAloud": {
              "accuses": "housekeeper",
              "text": "At the evidence table, {buyeragent} brings the case against {housekeeper} into the discussion. {housekeeper} found a chipped cup in the attic matching one from the measuring room. Having blamed missing food on a visitor makes that report hard to assess until her own theft is separated from the hidden room."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {buyeragent} brings the case against {mechanic} into the discussion. The stair repair by {mechanic} was requested by the surveyor. Otto carried an intact map into the workshop; the later tear and recovered coat button point to a confrontation, not proof that the parts thief caused it."
            }
          },
          {
            "readAloud": {
              "accuses": "teacher",
              "text": "At the evidence table, {buyeragent} brings the case against {teacher} into the discussion. {teacher}'s mistake helped the offer appear ordinary. The separate survey fee in the buyer's correspondence supplies a different, deliberate incentive. Compare the clause with the original plan before confusing a bad summary with a paid boundary change."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      },
      {
        "id": "musician",
        "name": "Lotte Brandt",
        "role": "The Traveling Musician",
        "publicBlurb": "You were stranded on the lane and invited in before the storm.",
        "rounds": [
          {
            "readAloud": {
              "accuses": "surveyor",
              "text": "At the evidence table, {musician} brings the case against {surveyor} into the discussion. {surveyor} is reported leaving the workshop after Otto enters with a map. A brass button lies by the desk and one is missing from the survey coat. Compare the sighting with the recovered object before deciding what happened inside."
            }
          },
          {
            "readAloud": {
              "accuses": "heir",
              "text": "At the evidence table, {musician} brings the case against {heir} into the discussion. {heir} hid the original boundary plan while the offered map diverted the valuable spring. Concealing the very document needed to check the sale deserves an explanation."
            }
          },
          {
            "readAloud": {
              "accuses": "mechanic",
              "text": "At the evidence table, {musician} brings the case against {mechanic} into the discussion. {mechanic} knew the side door was unforced and the hidden stair worked. Repairing that stair without permission could look like preparing a route until the identity of the person who requested it is considered."
            }
          },
          {
            "readAloud": {
              "accuses": "neighbor",
              "text": "At the evidence table, {musician} brings the case against {neighbor} into the discussion. The post moved by {neighbor} concerns pasture, not the north spring. The older footprints near the woods predate tonight's snow: the fence dispute does not establish a new intruder."
            }
          },
          {
            "readAloud": {
              "accuses": "postmaster",
              "text": "At the evidence table, {musician} brings the case against {postmaster} into the discussion. {postmaster} handled a parcel of map paper and an invoice addressed to the surveyor. Opening mail was misconduct, but those contents corroborate authorship rather than implicating a new weapon or visitor."
            }
          }
        ],
        "optional": false,
        "guest": "",
        "guestNote": ""
      }
    ],
    "edition": {
      "family": "blackthorn-farm",
      "playerCount": 9,
      "id": "blackthorn-farm-9-players",
      "revision": 1
    },
    "discloseKiller": false
  }
};
