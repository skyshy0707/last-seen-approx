# EN:

## Current Status // Dev Logs

> **Project Phase:** Research & Development  
> **Target:** Asynchronous & Multi-processed migration, Ingestion fixes.

Since the project is still in the research and development phase, the layered architecture is not strictly enforced across all components. I am currently mapping out what the orchestration layer should look like. For now, it is implemented as api.loaders — a pattern of activity-type loaders designed to handle their tasks in a fault-tolerant manner.

The project is being migrated onto an asynchronous, multi-processed architecture. Each data batch represents a single sequential operation. This is not an architectural whim, but a hard constraint imposed by the external API: "provide the token from the current response to receive the next data batch." This constraint prevents us from fetching activities in parallel from the outside, as data offset tokens are inherently non-deterministic.

As a result, identifying and fixing memory leaks is a key part of the current debugging process. We are evaluating memory constraints and determining how many deserialization processes can be safely distributed across different CPU cores.

### 🐛 Known Platform Issues / Chrome Manifest V3 Bug

A recent Google Chrome update has introduced false-positive errors appearing both in the browser console and within the extension background logs. 

Previously, importing these resources as native JS modules worked seamlessly, fully adhering to the URL pattern matches defined in `web_accessible_resources`. However, the updated Google Chrome security core layer now triggers the following error:

"Unsafe attempt to load URL chrome-extension://[EXTENSION_ID]/[RESOURCE_PATH]"

However, Javascript is stil not broken and work successfully.

Despite the background script being explicitly declared as `type: "module"` in the manifest, importing resources in an identical absolute manner should not result in this architectural absurdity. The application layout and FSD modules remain fully functional and successfully render the content after the initial false-positive block. A formal bug ticket needs to be submitted to the Google Extension API / Chromium development teams to resolve this regression.



#### Ongoing Tasks & Active Debugging:

Future tasks will focus on fetching activities from other previously skipped resources (such as collaborations, community posts, etc.). We are also continually analyzing the YouTube API for any potential response structure modifications.

All of the tasks mentioned above are currently undergoing active debugging.


### Bug Fixes & Improvements:

1. Activity Skipping: Fixed an issue where activities were being skipped. Previously, the ingestion process would halt prematurely because the manager encountered the last object from a previously loaded batch.

2. Skipping of Reply Comments in Subsequent Batches: Fixed the logic for processing comment replies.
How it worked "before": If the very first comment of the first fetched batch had a timestamp mathematically less than or equal to a previously loaded comment, the algorithm would ignore the rest of the batch (under the false assumption that no new comments could possibly follow).
Why this was wrong: It is fundamentally non-deterministic which batch will contain the latest reply comment. It is impossible to fetch all user comments ordered chronologically across each resource at once. Comment replies are structured as nested arrays within the top-level items. This behavior is fundamentally dictated by the strict architecture of the YouTube Data API.

3. Frontend migrated to Feature-Sliced Design (FSD) architecture from a modular approach.

4. Fixed an issue where mutations in the channel page DOM affected the visibility of the menu button.


# DE:

## Aktueller Status // Entwickler-Logs (Dev Logs)

> **Projektphase:** Forschung & Entwicklung
> **Ziel:** Asynchrone und multiprozessbasierte Migration, Korrekturen bei der Datenaufnahme (Ingestion).

Da sich das Projekt noch in der Forschungs- und Entwicklungsphase befindet, wird die Schichtenarchitektur (Layered Architecture) noch nicht an allen Stellen strikt eingehalten. Ich befinde mich derzeit in der Konzeptionsphase für die Orchestrierungsschicht. Momentan ist diese als api.loaders implementiert – ein Muster für Loader von Aktivitätstypen, das seine Aufgaben fehlertolerant löst.

Das Projekt wird auf eine asynchrone, multiprozessorfähige Architektur umgestellt. Jedes Datenpaket (Batch) stellt eine einzelne sequenzielle Operation dar. Dies ist keine architektonische Laune, sondern eine vorgegebene Einschränkung der externen API: „Übergib das Token aus der aktuellen Antwort, um das nächste Datenpaket zu erhalten.“ Diese Einschränkung verhindert eine parallele Abfrage von Aktivitäten von außen, da Daten-Offset-Token inhärent nicht-deterministisch sind.

### 🐛 Bekannte Plattform-Probleme / Chrome Manifest V3 Bug

Ein kürzliches Google Chrome-Update hat zu fehlerhaften Fehlermeldungen (False-Positives) geführt, die sowohl in der Browser-Konsole als auch in den Hintergrund-Logs der Extension auftreten.

Zuvor funktionierte der Import dieser Ressourcen als native JS-Module einwandfrei und entsprach vollständig den in `web_accessible_resources` definierten URL-Mustern. Das aktualisierte Sicherheits-Layer von Google Chrome erzeugt nun jedoch folgenden Fehler:

"Unsafe attempt to load URL chrome-extension://[EXTENSION_ID]/[RESOURCE_PATH]"

JavaScript ist jedoch nach wie vor intakt und funktioniert einwandfrei.

Obwohl das Hintergrund-Skript im Manifest explizit als `type: "module"` deklariert ist, sollte der identische absolute Import von Ressourcen nicht zu einer solchen architektonischen Absurdität führen. Das Anwendungs-Layout und die FSD-Module bleiben voll funktionsfähig und rendern den Inhalt nach der anfänglichen fehlerhaften Blockierung erfolgreich. Es muss ein offizielles Bug-Ticket bei den Entwicklerteams der Google Extension API oder von Chromium eingereicht werden, um diese Regression zu beheben.

#### Laufende Aufgaben & Aktivitäten – Fehlersuche (Debugging):

Im Zuge der Fehlerbehebung werden in dieser Phase Speicherlecks (Memory Leaks) identifiziert. Wir evaluieren die Speicherbegrenzungen und ermitteln, wie viele Deserialisierungsprozesse sicher auf verschiedene CPU-Kerne verteilt werden können.

Zukünftige Aufgaben werden sich auf das Abrufen von Aktivitäten für andere, zuvor übersprungene Ressourcen konzentrieren (z. B. Kollaborationen, Community-Beiträge usw.). Zudem wird die YouTube-API fortlaufend auf mögliche Änderungen der Antwortstruktur analysiert.
Alle oben genannten Aufgaben befinden sich derzeit in der aktiven Debugging-Phase.

### Behobene Fehler & Optimierungen:

1. Überspringen von Aktivitäten: Ein Fehler wurde behoben, bei dem Aktivitäten übersprungen wurden. Zuvor stoppte der Ladevorgang vorzeitig, da der Manager das letzte Objekt aus einem zuvor geladenen Datenpaket „gesehen“ hatte.

2. Überspringen von Antwort-Kommentaren (replies) in nachfolgenden Paketen: Die Logik für die Verarbeitung von Kommentar-Antworten wurde korrigiert. Funktionsweise „Vorher“: Wenn der allererste Kommentar des ersten abrufenen Datenpakets einen Zeitstempel aufwies, der mathematisch kleiner oder gleich einem zuvor geladenen Kommentar war, ignorierte der Algorithmus den Rest des Pakets (unter der falschen Annahme, dass keine neuen Kommentare folgen könnten).
Warum das falsch war: In welchem Paket sich der neueste Antwort-Kommentar befindet, ist fundamental nicht-deterministisch. Es ist unmöglich, alle Benutzerkommentare chronologisch geordnet über jede Ressource hinweg auf einmal abzurufen. Antwort-Kommentare (replies) sind als geschachtelte Arrays innerhalb der Top-Level-Elemente strukturiert. Dieses Verhalten ist rein durch die strikte Architektur der YouTube Data API vorgegeben.


3. Frontend von der modularen Architektur auf Feature-Sliced Design (FSD) umgestellt.

4. Der Einfluss von Mutationen im Kanal-Seiten-DOM auf die Sichtbarkeit des Menü-Buttons wurde behoben.


# RU:

## Текущая информация // Логи работ. 

> **Этап проекта:** Исследования и разработка
> **Цель:** Асинхронная многопроцессная миграция, исправления в механизмах загрузки данных.

Поскольку проект ещё на исследовательском этапе, то слоистая архитектура не везде соблюдается.
Я ещё на стадии понимания как должен выглядеть слой оркестрации. Пока он представляет собой `api.loaders` - шаблон загрузчиков
типов активностей, который отказоустойчиво решает свои задачи

Проект переводится на возможные асинхронные, многопоточные "рельсы".
Каждая партия данных - одна последовательная операция. 
Это не архитектурная прихоть, а данность внешнего api: "предоставь токен из текущего ответа - получи следующую партию данных"
Что не позволяет обращаться с активностями параллельно из вне: токены смещений данных - это недетерменированная информация.

### 🐛 Известные проблемы платформы / Chrome Manifest V3

Недавнее обновление Google Chrome вызвало ошибки как в консоли браузера, так и в самом расширении. Хотя, разрешения
страниц, соотвествующих шаблонам url, к которым допускаются ресурсы в манифесте были установленыи и до недавнего обновления работали импорты этих ресурсов как модулей js. То сейчас, браузеру Google Chrome на уровне ядра это не нравится:

"Unsafe attempt to load URL chrome-extension://[EXTENSION_ID]/[RESOURCE_PATH]"

Однако, Javascript-код пока ещё выполняем в модульном стиле.

Несмотря, на то, что фоновый скрипт объявлен в манифесте как модуль, то импортирумые ресурсы таким же образом не должны приводить
к подобному абсурду. Следует создавать тикет на устранение данного бага разработчиками Google Extension API или самого Chrome.

### Отладка и доп. исследования:

* И здесь, в ходе отладки будут выявляться утечки памяти.
Сколько у нас памяти, сколько процессов десериализации можно запускать по разным ядрам.

* Будут решаться задачи получения активностей по другим, ранее пропущенным ресурсам (коллаборации, посты и т.д.)

* Изучается Youtube API на предмет изменения структуры ответа.

* По всем этим задачам ведётся отладка.

#### Исправлено:

1. Пропуск активностей. Ранее активности пропускались: загрузка останаливалась, так как менеджер "увидел" последний объект из ранее загруженной партии

2. Пропускались комментарии ответов (replies) следующих партий. Как это работало "до": Если при загрузке первой партии первый 
её комментарий имеет метку времени в математическом смысле ниже или ту же, что ранее загруженный, то поэтому остальная 
игноривалась алгоритмом (иллюзия, что новых быть якобы не может). Нельзя так делать: В какой партии самый поздний комментарий-ответ - вопрос открытый. Все комментарии пользователя, упорядоченные по времени, по каждому ресурсу получить нельзя. Комментарии-ответы (replies)
структурируются как вложения. Это опять-таки устройство api. 

3. Фронтенд переведён на FSD архитектуре от модульной.

4. Устранено влияние мутаций DOM страницы канала на присутствие кнопки меню.