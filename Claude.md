Projekt feladatok
Repo: https://github.com/kgergo1713/RentACar
Projekt név: RentACar
Platform: GitHub pages-en indítható, böngészőben futó webui, user eszközén tárolt adatokkal
Leírás: Bérautók kiadása, szerződés nyomtatása sablonok, berlok és autok CRUD táblák alapján

A felhasználó elindítja az appot, kiválasztja a szerződést, hozzá kiválaszt 1 autót és 1 bérlőt. Átnézi, esetleg szerkeszti a szerződés adatait, majd kinyomtatja azt.

Egyszerű, letisztult, professzionális megjelenítés. 
A menüpontok nagyméretű ikonok, szöveges megjelenítéssel, tooltipként 1 mondatos funkcióleírás
Light/dark mód
Többnyelvű megjelenítés, zászlóval történő kiválasztás, kezdetben ENG / HUN, default HUN

3 féle CRUD tábla:
1: Bérlők (emberek ikon) (USERS)
	Magánszemély esetén:
		Név, Lakcím, Telefonszám, e-mail (opció), Személyi igazolvány száma, Jogosítvány száma
	Cég esetén:
		Cégnév, Adószám, Cím, Meghatalmazott
		Átvevő, ami cég esetén több is lehet, adatok a Magánszemélyek lista szerint
2: Autók (autó ikon) - lásd SampleCarList.md (CARS)
	Személy / teher
	Típus (pl. FORD, VW, Mercedes, ...)
	Kivitel (pl. sedan, kombi, platós, dobozos, ...)
	Szállítható személyek száma
	Raktér, ajtók
	Méret
	Kaució
	Napidíj
	Rendszám
	Üzemanyag típusa (ez mindig nagybetűvel!)
	Megjegyzés
3: Sablonok (dokumentum ikon) (TEMPLATES)
	Logó (betölthető grafikus állomány, általános formátumokat kezelje)
	Fejléc
	Lábléc
	Dokumentum törzs hivatkozással a USERS és CARS táblák celláira, formázással

Főképernyőn 5 nagy méretű ikon:
	Szerződés (dokumentum kézfogással ikon)
	Sablonok
	Autók
	Bérlők
	Beállítások (fogaskerék ikon)

Szerződés
	Itt először kiválasztja a bérlőt - ha nincs a listában, itt is hozzá tudja adni későbbre (ugyanaz a beviteli felület legyen, mint a USERS CREATE esetén). Fontos: a USERS listából csak név alapján lehet kiválasztani (adatvédelmi okokból, mert a szerkesztés közben a bérlő látja a WEBUI-t!)
	Bérlő után autó kiválasztása
	Majd sablon kiválasztása
	Ha minden ki lett választva, a sablonba átkerülnek a USERS és CARS adatok a megfelelő mezőkbe és itt még lehet a dokumentum törzsében bármit módosítani!


	
