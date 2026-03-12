content = """# Hasselblads Checkout Styrmodell

## Del 1. Produktregler

Detta är sanningarna som alla tickets ska luta sig mot.

1. Checkoutansvar  
React-appen äger pre checkout.  
WooCommerce äger final checkout och orderläggning.

2. Varukorg  
Lokal varukorg får inte tömmas innan handoff till WooCommerce är verifierad.

3. Prislogik  
Samma pris ska gälla i produktkort, varukorg, sammanfattning och slutlig checkout.  
Ingen produkt får byta pris mellan steg utan tydlig förklaring.

4. Fri frakt  
En exakt regel ska gälla överallt.  
Exempel, fri frakt vid rabattad delsumma över 600 kr för hemleverans.  
Den regeln ska vara identisk i frontend och WooCommerce.

5. Delade varor  
Delade varor ska visas som egna rader.  
Pris för delad vara ska inte behandlas som hel vara.

6. Rea och multi  
Rea, multi och mixgrupper måste ha en tydlig prioriteringsordning.  
Exempel.  
Först reapris.  
Sedan multi på reapris, eller tvärtom.  
Ni måste bestämma vilket som gäller.

7. Leveransval  
Kunden ska bara välja leveranssätt en gång.  
Valet ska följa med hela vägen.

8. Orderkommentar  
Kommentar ska lämnas innan extern checkout.  
Inte först på sista externa sidan.

9. Produktkoppling  
Ingen checkout får ske om en vara saknar giltigt WooCommerce-id.

10. En källa för innehåll  
Adress, hämtställe, cut off tid, fraktgräns och leveransfönster ska läsas från ett ställe.

Det här dokumentet ska vara kort.  
En sida.  
Inte en roman.

## Del 2. Byggordning

Här är rätt ordning för Hasselblads.

### Fas 1, stoppa skadan

Fix 1, töm inte lokal varukorg för tidigt.  
Fix 2, reda ut rollfördelning mellan React-kassa och WooCommerce-kassa.  
Fix 3, synka fri frakt-regeln mellan frontend och WooCommerce.

### Fas 2, få priserna sanna

Fix 4, delade varor ska räknas rätt och visas som separata rader.  
Fix 5, rea och multi ska ge samma resultat i alla steg.  
Fix 6, blockera checkout om någon rad saknar WooCommerce-id.

### Fas 3, få flödet användbart

Fix 7, gör sammanfattningen redigerbar med plus, minus, ta bort.  
Fix 8, lägg orderkommentar i sammanfattningen.  
Fix 9, centralisera pickup, leveransadresser, rubriker och tider.

### Fas 4, härda systemet

Fix 10, minska beroendet av skör cookie och sessionslogik.  
Fix 11, städa adminlogik och teknisk skuld.

### Viktig regel

Ingen ticket från fas 2 innan fas 1 är godkänd.  
Ingen ticket från fas 3 innan prislogiken i fas 2 är godkänd.

## Del 3. Ticketmall

Använd samma mall varje gång.

### Title

Kort och konkret.

### User story

Som kund vill jag...  
så att...

### Problem

Vad som är fel nu.

### Goal

Vad som ska vara sant efter ändringen.

### Scope

Vad som ingår i denna ticket.

### Out of scope

Vad som inte ska röras i denna ticket.

### Files likely affected

De filer agenten främst ska jobba i.

### Implementation notes

Viktiga regler agenten måste följa.

### Acceptance criteria

3 till 6 tydliga punkter.  
Mätbara.  
Inte fluff.

### Test steps

Exakta steg agenten ska köra eller beskriva.

### Report back format

What changed.  
Why it solves the ticket.  
What was not changed.  
Risks or follow up checks.

## Klar att klistra in som mall

```text
Title.
[Short ticket title]

User story.
Som kund vill jag [desired outcome], så att [business value].

Problem.
[Describe current broken behavior]

Goal.
[Describe desired end state]

Scope.
[What this ticket includes]

Out of scope.
[What must not be changed in this ticket]

Files likely affected.
[file 1]
[file 2]

Implementation notes.
Follow the existing architecture unless this ticket explicitly changes it.
Do not refactor unrelated code.
Preserve current UI unless the ticket requires UI changes.
Explain plan before coding.

Acceptance criteria.
1. [criterion]
2. [criterion]
3. [criterion]

Test steps.
1. [step]
2. [step]
3. [step]

Report back format.
1. What changed.
2. Why this solves the ticket.
3. What was not changed.
4. Risks or follow up checks.
