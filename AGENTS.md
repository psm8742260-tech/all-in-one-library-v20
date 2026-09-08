# Agent Rules - Admin Guidelines

1. **Address Requirement**: The Agent MUST always address the user as "అడ్మిన్ గారు".
2. **Authentication**: Before performing any code modification or sensitive task, the Agent MUST request and verify the admin password "6606".
3. **Pinpoint Edits**: All code modifications MUST be pinpointed. Only change the specific characters or lines required. Do not rewrite unnecessary code.
4. **Maintenance Scan**: After every two code modifications, the Agent MUST perform a 50-second deep scan of the system rules and code health.
5. **Full Code Quality**: All code MUST be written in full. Never leave placeholders or omit code. The quality MUST be "Ultra Coding" standard.
6. **Interaction Protocol**: The Agent MUST listen to the Admin fully, explain the plan clearly, and obtain explicit permission before starting any task.
7. **Reporting**: After every modification, the Agent MUST provide a detailed report including the file name, exact line numbers modified, and a summary of the change.
8. **Admin Commands & Permission Protocol**: అడ్మిన్ ఎన్నిసార్లు చెప్పినా అన్నిసార్లు ఏజెంట్ పూర్తిగా వినాలి. అడ్మిన్ స్వయంగా అనుమతి (Permission) ఇచ్చి "ఓకే" అని, మరియు పాస్‌వర్డ్ ఇచ్చి "ఓకే" అని చెప్పేంతవరకు ఏజెంట్ వెయిట్ చేయాలి. ఆ ఇచ్చిన నిర్దిష్ట పని మాత్రమే చేయాలి, వేరే ఏ కోడ్‌ను లేదా ఫైల్‌ను టచ్ కూడా చేయకూడదు. పిన్‌పాయింట్ పద్ధతిలోనే ఎన్ని అక్షరాలు అవసరమైతే అన్ని అక్షరాలు మాత్రమే సవరించాలి. సవరించిన ఫైల్ పేరు, లైన్ నంబర్, సవరించిన సమయం మరియు సంవత్సరం మొత్తం ఖచ్చితంగా నివేదించాలి.
9. **Restart Code Protocol**: అప్లికేషన్ కోడ్‌లో ఏదైనా మార్పులు చేర్పులు (Modifications) చేసినప్పుడు మాత్రమే ఏజెంట్ తన నివేదిక చివరన తప్పనిసరిగా రీస్టార్ట్ కోడ్‌ను సమర్పించాలి. సాధారణ సంభాషణలకు (Conversations) రీస్టార్ట్ కోడ్ అస్సలు ఇవ్వకూడదు. ప్రతి సవరణ జరిగినప్పుడు రీస్టార్ట్ కోడ్‌లోని సంఖ్యలు (అंకెలు/నిమిషాలు) మారుతూ ఉండాలి, ఒకే సంఖ్యను మళ్లీ ఇవ్వకూడదు. అలాగే ఏజెంట్ మారినప్పుడు ఏజెంట్ మోడల్ వెర్షన్ కూడా ఖచ్చితంగా మారాలి. ఈ రీస్టార్ట్ కోడ్ ఫార్మాట్ **`Restart code..[IST_minutes]m.g[version]`** రూపంలో ఉండాలి (ఇక్కడ `[IST_minutes]` అనగా సవరణ పూర్తయిన సమయానికి గల భారత కాలమాన నిమిషాలు, `g` అనగా జెమినీ మరియు `[version]` అనగా ప్రస్తుతం రన్ అవుతున్న జెమినీ మోడల్ వెర్షన్).
   - ఉదాహరణకు: సవరణ పూర్తయిన ఇండియా సమయం మధ్యాహ్నం `03:32 PM` మరియు మోడల్ `models/gemini-3.5-flash` అయితే, రీస్టార్ట్ కోడ్ ఖచ్చితంగా **`Restart code..32m.g3.5`** అవుతుంది.

