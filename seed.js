"use strict";
/* Contenu pédagogique initial. Tout est ensuite modifiable depuis le panneau
   d'administration : ce fichier ne sert qu'au premier démarrage. */

const UNITS = [
{slug:"u1",title:"Les bases",subtitle:"Variables, types, opérateurs",color:"#58CC02",lessons:[
 {slug:"u1-l1",title:"Variables et types",items:[
  {t:"qcm",q:"Que vaut `7 / 2` en Python 3 ?",choices:["3","3.5","3.0","Une erreur"],a:1,ex:"L'opérateur / renvoie toujours un flottant, même quand la division tombe juste."},
  {t:"qcm",q:"Et `7 // 2` ?",choices:["3","3.5","4","1"],a:0,ex:"// est la division entière : le quotient arrondi vers le bas."},
  {t:"gaps",q:"Complète pour obtenir le reste de la division.",code:"x = 17\ny = 5\nprint(x ___ y)   # affiche 2",bank:["%","//","**","/"],a:["%"],ex:"% est le modulo : 17 % 5 vaut 2."},
  {t:"qcm",q:"Lequel de ces objets est immuable ?",choices:["list","dict","tuple","set"],a:2,ex:"Un tuple ne peut pas être modifié après création."},
  {t:"free",q:"Écris l'instruction qui affecte la valeur 3.14 à la variable `pi`.",sol:"pi = 3.14",ex:"L'affectation se fait avec un seul signe =."}]},
 {slug:"u1-l2",title:"Opérateurs",items:[
  {t:"qcm",q:"Que vaut `2 ** 10` ?",choices:["20","100","1024","512"],a:2,ex:"** est la puissance : 2^10 = 1024."},
  {t:"qcm",q:"Que renvoie `bool(0)` ?",choices:["True","False","0","Une erreur"],a:1,ex:"0, la chaîne vide et la liste vide sont considérés comme faux."},
  {t:"qcm",q:'Que vaut `"3" + "4"` ?',choices:["7",'"7"','"34"',"Une erreur"],a:2,ex:"Avec deux chaînes, + concatène."},
  {t:"gaps",q:"Convertis la chaîne en entier.",code:'s = "42"\nn = ___(s)\nprint(n + 1)   # affiche 43',bank:["int","str","float","eval"],a:["int"],ex:"int() convertit une chaîne représentant un entier."},
  {t:"free",q:"Écris l'expression booléenne qui teste si `n` est pair.",sol:"n % 2 == 0",accept:["0 == n % 2"],ex:"Un entier est pair si son reste dans la division par 2 est nul."}]},
 {slug:"u1-l3",title:"Chaînes de caractères",items:[
  {t:"qcm",q:'Avec `s = "Python"`, que vaut `s[2]` ?',choices:['"P"','"y"','"t"','"h"'],a:2,ex:"L'indexation commence à 0."},
  {t:"qcm",q:'Que vaut `s[-1]` avec `s = "Python"` ?',choices:['"P"','"n"','"o"',"Une erreur"],a:1,ex:"Les indices négatifs partent de la fin."},
  {t:"gaps",q:"Inverse la chaîne avec une tranche.",code:'s = "prepa"\nprint(s[___])   # affiche "aperp"',bank:["::-1",":-1","0:-1","-1:"],a:["::-1"],ex:"s[::-1] parcourt la chaîne avec un pas de -1."},
  {t:"qcm",q:'Que vaut `len("algorithme")` ?',choices:["9","10","11","8"],a:1,ex:"a-l-g-o-r-i-t-h-m-e : 10 caractères."},
  {t:"free",q:'Avec `s = "informatique"`, écris la tranche qui renvoie `"forma"`.',sol:"s[2:7]",ex:"La tranche s[a:b] va de a inclus à b exclu."}]}]},

{slug:"u2",title:"Conditions et boucles",subtitle:"if, for, while",color:"#1CB0F6",lessons:[
 {slug:"u2-l1",title:"Conditions",items:[
  {t:"qcm",q:"Qu'affiche ce programme ?",code:'x = 5\nif x > 10:\n    print("grand")\nelif x > 3:\n    print("moyen")\nelse:\n    print("petit")',choices:["grand","moyen","petit","rien"],a:1,ex:"5 n'est pas > 10 mais il est > 3 : la branche elif est exécutée."},
  {t:"gaps",q:"Complète le mot-clé manquant.",code:'if n < 0:\n    print("négatif")\n___ n == 0:\n    print("nul")\nelse:\n    print("positif")',bank:["elif","else if","elseif","if else"],a:["elif"],ex:"La contraction de else if s'écrit elif."},
  {t:"qcm",q:"Que vaut `(3 > 2) and (2 > 5)` ?",choices:["True","False","None","Erreur"],a:1,ex:"and n'est vrai que si les deux conditions sont vraies."},
  {t:"order",q:"Remets dans l'ordre cette fonction valeur absolue.",lines:["def abs2(x):","    if x < 0:","        return -x","    return x"],ex:"On teste d'abord le cas négatif."},
  {t:"free",q:"Écris la condition testant que `n` est divisible à la fois par 3 et par 5.",sol:"n % 3 == 0 and n % 5 == 0",accept:["n % 15 == 0"],ex:"Deux tests reliés par and, ou un test sur 15."}]},
 {slug:"u2-l2",title:"Boucle for",items:[
  {t:"qcm",q:"Combien de fois la boucle `for i in range(5):` s'exécute-t-elle ?",choices:["4","5","6","Ça dépend"],a:1,ex:"range(5) produit 0,1,2,3,4."},
  {t:"qcm",q:"Quelles valeurs prend `i` dans `for i in range(2, 10, 3):` ?",choices:["2, 5, 8","2, 5, 8, 11","2, 3, …, 9","3, 6, 9"],a:0,ex:"On part de 2, on ajoute 3, on s'arrête avant 10."},
  {t:"gaps",q:"Complète l'accumulateur qui calcule la somme des entiers de 1 à n.",code:"s = 0\nfor i in range(1, n + 1):\n    s ___ i\nprint(s)",bank:["+=","=","-=","=="],a:["+="],ex:"s += i est un raccourci pour s = s + i."},
  {t:"order",q:"Remets dans l'ordre la factorielle itérative.",lines:["def fact(n):","    p = 1","    for i in range(2, n + 1):","        p = p * i","    return p"],ex:"On initialise l'accumulateur à 1, puis on multiplie."},
  {t:"free",q:"Écris l'en-tête de boucle qui parcourt les indices de la liste `L`.",sol:"for i in range(len(L)):",ex:"range(len(L)) donne tous les indices valides."}]},
 {slug:"u2-l3",title:"Boucle while",items:[
  {t:"qcm",q:"Qu'affiche ce programme ?",code:"n = 10\nc = 0\nwhile n > 1:\n    n = n // 2\n    c = c + 1\nprint(c)",choices:["2","3","4","5"],a:1,ex:"10 → 5 → 2 → 1 : trois divisions."},
  {t:"gaps",q:"Complète la condition d'arrêt.",code:"n = 100\nwhile n ___ 0:\n    n = n - 7\nprint(n)",bank:[">=","<=","==","!="],a:[">="],ex:"On continue tant que n reste positif ou nul."},
  {t:"order",q:"Remets dans l'ordre l'algorithme d'Euclide.",lines:["def pgcd(a, b):","    while b != 0:","        a, b = b, a % b","    return a"],ex:"On remplace (a,b) par (b, a mod b) jusqu'à b nul."},
  {t:"qcm",q:"Pourquoi ce code ne s'arrête-t-il jamais ?",code:"i = 0\nwhile i < 10:\n    print(i)",choices:["La condition est fausse","i n'est jamais incrémenté","print bloque la boucle","Il manque un else"],a:1,ex:"Sans modification de i, la condition reste vraie."},
  {t:"free",q:"Écris l'échange des valeurs de `a` et `b` sur une seule ligne.",sol:"a, b = b, a",ex:"Python évalue d'abord la droite en tuple."}]}]},

{slug:"u3",title:"Fonctions",subtitle:"Paramètres, portée, récursivité",color:"#CE82FF",lessons:[
 {slug:"u3-l1",title:"Définir une fonction",items:[
  {t:"qcm",q:"Que renvoie une fonction sans instruction `return` ?",choices:["0","None","False","Une erreur"],a:1,ex:"Python renvoie implicitement None."},
  {t:"gaps",q:"Complète la définition.",code:"___ carre(x):\n    return x * x",bank:["def","function","fun","lambda"],a:["def"],ex:"Le mot-clé def introduit une fonction."},
  {t:"qcm",q:"Qu'affiche ce programme ?",code:"def f(x, y=2):\n    return x ** y\n\nprint(f(3))",choices:["3","6","9","Erreur"],a:2,ex:"y vaut 2 par défaut, donc 3**2 = 9."},
  {t:"order",q:"Remets dans l'ordre la fonction maximum de deux nombres.",lines:["def maxi(a, b):","    if a > b:","        return a","    else:","        return b"],ex:"Un return interrompt immédiatement la fonction."},
  {t:"free",q:"Écris la ligne qui renvoie le double de `x`.",sol:"return 2 * x",accept:["return x * 2","return x + x"],ex:"return transmet la valeur à l'appelant."}]},
 {slug:"u3-l2",title:"Portée et effets de bord",items:[
  {t:"qcm",q:"Qu'affiche ce programme ?",code:"def ajoute(L):\n    L.append(4)\n\nt = [1, 2, 3]\najoute(t)\nprint(t)",choices:["[1, 2, 3]","[1, 2, 3, 4]","None","Erreur"],a:1,ex:"Les listes sont mutables : la fonction modifie l'originale."},
  {t:"qcm",q:"Qu'affiche ce programme ?",code:"def f(x):\n    x = x + 1\n\nn = 5\nf(n)\nprint(n)",choices:["5","6","None","Erreur"],a:0,ex:"Les entiers sont immuables."},
  {t:"gaps",q:"Crée une copie de la liste pour ne pas modifier l'originale.",code:"def trie_copie(L):\n    M = L[___]\n    M.sort()\n    return M",bank:[":","0","::2","-1"],a:[":"],ex:"L[:] renvoie une copie superficielle."},
  {t:"qcm",q:"Pourquoi `def f(L=[])` est-il un piège classique ?",choices:["La syntaxe est invalide","La liste par défaut est créée une seule fois et conservée entre les appels","Python interdit les listes en paramètre","L devient globale"],a:1,ex:"L'objet par défaut est évalué à la définition."},
  {t:"free",q:"Écris l'instruction qui déclare `compteur` comme variable globale.",sol:"global compteur",ex:"global permet de modifier une variable extérieure."}]},
 {slug:"u3-l3",title:"Récursivité",items:[
  {t:"qcm",q:"Quel est le cas de base de la factorielle récursive ?",choices:["fact(1) = 0","fact(0) = 1","fact(n) = n","Il n'y en a pas"],a:1,ex:"Par convention 0! = 1."},
  {t:"gaps",q:"Complète l'appel récursif.",code:"def fact(n):\n    if n == 0:\n        return 1\n    return n * fact(___)",bank:["n - 1","n","n + 1","n // 2"],a:["n - 1"],ex:"Chaque appel se rapproche du cas de base."},
  {t:"order",q:"Remets dans l'ordre la somme récursive d'une liste.",lines:["def somme(L):","    if L == []:","        return 0","    return L[0] + somme(L[1:])"],ex:"Cas de base : liste vide."},
  {t:"qcm",q:"Complexité de `fibo(n)` par récursion double naïve ?",choices:["O(n)","O(n log n)","O(n²)","O(2^n)"],a:3,ex:"Chaque appel en déclenche deux. La mémoïsation ramène à O(n)."},
  {t:"free",q:"Écris le test du cas de base sur une liste vide `L`.",sol:"if len(L) == 0:",accept:["if L == []:","if not L:"],ex:"Trois écritures acceptées."}]}]},

{slug:"u4",title:"Structures de données",subtitle:"Listes, dictionnaires, ensembles",color:"#FFC800",lessons:[
 {slug:"u4-l1",title:"Listes et tranches",items:[
  {t:"qcm",q:"Que vaut `L[1:3]` avec `L = [10, 20, 30, 40]` ?",choices:["[10, 20]","[20, 30]","[20, 30, 40]","[10, 20, 30]"],a:1,ex:"Borne gauche incluse, droite exclue."},
  {t:"qcm",q:"Quelle méthode ajoute un élément à la fin d'une liste ?",choices:["L.add(x)","L.push(x)","L.append(x)","L.insert(x)"],a:2,ex:"append ajoute en fin, en temps constant amorti."},
  {t:"gaps",q:"Complète pour concaténer deux listes.",code:"A = [1, 2]\nB = [3, 4]\nC = A ___ B",bank:["+","&","and","*"],a:["+"],ex:"+ concatène et renvoie une nouvelle liste."},
  {t:"qcm",q:"Qu'affiche ce programme ?",code:"L = [1, 2, 3]\nM = L\nM.append(4)\nprint(L)",choices:["[1, 2, 3]","[1, 2, 3, 4]","[4]","Erreur"],a:1,ex:"M = L ne copie pas : même objet."},
  {t:"free",q:"Écris l'expression qui donne le dernier élément de `L`.",sol:"L[-1]",accept:["L[len(L) - 1]"],ex:"L'indice -1 désigne le dernier élément."}]},
 {slug:"u4-l2",title:"Compréhensions de liste",items:[
  {t:"qcm",q:"Que vaut `[x * x for x in range(4)]` ?",choices:["[1, 4, 9, 16]","[0, 1, 4, 9]","[0, 1, 2, 3]","[0, 2, 4, 6]"],a:1,ex:"range(4) donne 0,1,2,3."},
  {t:"gaps",q:"Ne garde que les nombres pairs.",code:"L = [x for x in range(10) ___ x % 2 == 0]",bank:["if","while","for","and"],a:["if"],ex:"Le filtre s'écrit avec if en fin de compréhension."},
  {t:"qcm",q:"Que crée `[[0] * 3 for _ in range(2)]` ?",choices:["Une liste de 3 zéros","Une matrice 2×3 de zéros","Une matrice 3×2 de zéros","Une erreur"],a:1,ex:"Deux lignes de trois zéros."},
  {t:"qcm",q:"Pourquoi éviter `M = [[0] * 3] * 2` ?",choices:["La syntaxe est fausse","Les deux lignes sont le même objet","C'est trop lent","Ça crée des flottants"],a:1,ex:"* duplique la référence, pas le contenu."},
  {t:"free",q:"Écris la compréhension des carrés des entiers de 1 à 5 inclus.",sol:"[x * x for x in range(1, 6)]",accept:["[x ** 2 for x in range(1, 6)]"],ex:"range(1, 6) s'arrête à 5."}]},
 {slug:"u4-l3",title:"Dictionnaires et ensembles",items:[
  {t:"qcm",q:'Que renvoie `d.get("z", 0)` si la clé est absente ?',choices:["None","0","Une erreur KeyError","False"],a:1,ex:"get renvoie la valeur par défaut."},
  {t:"qcm",q:"Que vaut `len(set([1, 2, 2, 3, 3, 3]))` ?",choices:["3","6","2","1"],a:0,ex:"Un ensemble supprime les doublons."},
  {t:"gaps",q:"Complète le comptage d'occurrences.",code:'d = {}\nfor c in "banane":\n    d[c] = d.___(c, 0) + 1',bank:["get","pop","keys","add"],a:["get"],ex:"d.get(c, 0) donne 0 à la première rencontre."},
  {t:"order",q:"Remets dans l'ordre le parcours des couples clé/valeur.",lines:['d = {"a": 1, "b": 2}',"for cle, valeur in d.items():","    print(cle, valeur)"],ex:"items() renvoie les paires (clé, valeur)."},
  {t:"qcm",q:"Complexité moyenne d'un accès `d[k]` ?",choices:["O(1)","O(log n)","O(n)","O(n log n)"],a:0,ex:"Table de hachage : accès constant en moyenne."}]}]},

{slug:"u5",title:"Algorithmique",subtitle:"Complexité, tris, dichotomie",color:"#FF4B4B",lessons:[
 {slug:"u5-l1",title:"Complexité",items:[
  {t:"qcm",q:"Quelle est la complexité de ce code ?",code:"for i in range(n):\n    for j in range(n):\n        print(i, j)",choices:["O(n)","O(n log n)","O(n²)","O(2^n)"],a:2,ex:"Deux boucles imbriquées de n itérations."},
  {t:"qcm",q:"Complexité d'une recherche dichotomique ?",choices:["O(1)","O(log n)","O(n)","O(n log n)"],a:1,ex:"La zone de recherche est divisée par deux à chaque étape."},
  {t:"qcm",q:"Complexité au pire du tri par insertion ?",choices:["O(n)","O(n log n)","O(n²)","O(log n)"],a:2,ex:"Chaque insertion parcourt toute la partie triée."},
  {t:"qcm",q:"Classe ces complexités de la plus rapide à la plus lente.",choices:["O(n²) < O(n) < O(log n)","O(log n) < O(n) < O(n²)","O(n) < O(log n) < O(n²)","Elles sont équivalentes"],a:1,ex:"Logarithmique, puis linéaire, puis quadratique."},
  {t:"qcm",q:"Complexité de `L.pop(0)` sur une liste Python ?",choices:["O(1)","O(log n)","O(n)","O(n²)"],a:2,ex:"Retirer en tête décale tous les éléments."}]},
 {slug:"u5-l2",title:"Les tris",items:[
  {t:"order",q:"Remets dans l'ordre le tri par sélection.",lines:["def tri_selection(L):","    for i in range(len(L)):","        m = i","        for j in range(i + 1, len(L)):","            if L[j] < L[m]:","                m = j","        L[i], L[m] = L[m], L[i]"],ex:"On cherche le minimum du reste puis on l'échange."},
  {t:"qcm",q:"Quelle est la complexité du tri fusion ?",choices:["O(n)","O(n log n)","O(n²)","O(log n)"],a:1,ex:"log n niveaux, chacun en O(n)."},
  {t:"gaps",q:"Complète l'échange de deux éléments.",code:"def echange(L, i, j):\n    L[i], L[j] = ___",bank:["L[j], L[i]","L[i], L[j]","j, i","L[j]"],a:["L[j], L[i]"],ex:"L'affectation multiple évalue la droite d'abord."},
  {t:"qcm",q:"Que fait `sorted(L)` par rapport à `L.sort()` ?",choices:["Rien de différent","sorted renvoie une nouvelle liste, sort trie sur place","sorted trie sur place","sort est plus lent"],a:1,ex:"L.sort() modifie L et renvoie None."},
  {t:"free",q:"Écris l'appel qui trie `L` par ordre décroissant sans la modifier.",sol:"sorted(L, reverse=True)",ex:"reverse=True inverse l'ordre."}]},
 {slug:"u5-l3",title:"Recherche dichotomique",items:[
  {t:"qcm",q:"Quelle condition le tableau doit-il vérifier ?",choices:["Être de taille paire","Être trié","Ne contenir que des entiers","Aucune"],a:1,ex:"Sans tri, la comparaison au milieu n'informe pas."},
  {t:"gaps",q:"Complète le calcul de l'indice milieu.",code:"g, d = 0, len(L) - 1\nwhile g <= d:\n    m = (g + d) ___ 2",bank:["//","/","%","**"],a:["//"],ex:"Il faut un indice entier."},
  {t:"order",q:"Remets dans l'ordre la recherche dichotomique.",lines:["def recherche(L, x):","    g, d = 0, len(L) - 1","    while g <= d:","        m = (g + d) // 2","        if L[m] == x:","            return m","        elif L[m] < x:","            g = m + 1","        else:","            d = m - 1","    return -1"],ex:"On réduit l'intervalle jusqu'à le vider."},
  {t:"qcm",q:"Environ combien d'étapes pour 1000 éléments ?",choices:["3","10","31","1000"],a:1,ex:"log2(1000) ≈ 10."},
  {t:"free",q:"Écris la mise à jour de la borne gauche quand `L[m] < x`.",sol:"g = m + 1",ex:"x se trouve strictement à droite de m."}]}]},

{slug:"u6",title:"Sujets de concours",subtitle:"Piles, files, diviser pour régner",color:"#4EAE32",lessons:[
 {slug:"u6-l1",title:"Piles et files",items:[
  {t:"qcm",q:"Une pile fonctionne selon le principe :",choices:["Premier entré, premier sorti","Dernier entré, premier sorti","Ordre aléatoire","Ordre trié"],a:1,ex:"LIFO."},
  {t:"gaps",q:"Complète pour dépiler le sommet.",code:"pile = [1, 2, 3]\nsommet = pile.___()",bank:["pop","append","remove","top"],a:["pop"],ex:"pop() retire et renvoie le dernier élément."},
  {t:"qcm",q:"Pour une file efficace en Python, on utilise :",choices:["list avec pop(0)","collections.deque","set","dict"],a:1,ex:"deque : ajout et retrait aux deux bouts en O(1)."},
  {t:"order",q:"Remets dans l'ordre le test de parenthésage.",lines:["def bien_parenthese(s):","    pile = []","    for c in s:",'        if c == "(":',"            pile.append(c)",'        elif c == ")":',"            if pile == []:","                return False","            pile.pop()","    return pile == []"],ex:"La pile doit finir vide."},
  {t:"free",q:"Écris l'instruction qui empile `x` dans la liste `pile`.",sol:"pile.append(x)",ex:"append ajoute au sommet."}]},
 {slug:"u6-l2",title:"Tableaux à deux dimensions",items:[
  {t:"qcm",q:"Avec `M = [[1, 2, 3], [4, 5, 6]]`, que vaut `M[1][2]` ?",choices:["2","3","5","6"],a:3,ex:"M[1] = [4,5,6], indice 2 → 6."},
  {t:"gaps",q:"Complète la création d'une matrice nulle p×n.",code:"M = [[0] * n for _ in ___(p)]",bank:["range","len","list","int"],a:["range"],ex:"range(p) génère p lignes indépendantes."},
  {t:"qcm",q:"Comment obtenir le nombre de colonnes de `M` ?",choices:["len(M)","len(M[0])","M.size","len(M) - 1"],a:1,ex:"len(M) = lignes, len(M[0]) = colonnes."},
  {t:"order",q:"Remets dans l'ordre la somme des coefficients.",lines:["def somme(M):","    s = 0","    for i in range(len(M)):","        for j in range(len(M[0])):","            s = s + M[i][j]","    return s"],ex:"Double boucle et accumulateur."},
  {t:"free",q:"Écris l'expression donnant le nombre de lignes de `M`.",sol:"len(M)",ex:"Une matrice est une liste de lignes."}]},
 {slug:"u6-l3",title:"Diviser pour régner",items:[
  {t:"qcm",q:"Complexité de l'exponentiation rapide ?",choices:["O(1)","O(log n)","O(n)","O(n log n)"],a:1,ex:"L'exposant est divisé par deux à chaque appel."},
  {t:"gaps",q:"Complète l'exponentiation rapide.",code:"def puissance(x, n):\n    if n == 0:\n        return 1\n    y = puissance(x, n ___ 2)\n    if n % 2 == 0:\n        return y * y\n    return x * y * y",bank:["//","/","-","%"],a:["//"],ex:"Appel récursif sur n//2 puis mise au carré."},
  {t:"qcm",q:"Lequel n'utilise pas diviser pour régner ?",choices:["Tri fusion","Recherche dichotomique","Tri par insertion","Exponentiation rapide"],a:2,ex:"Le tri par insertion est incrémental."},
  {t:"qcm",q:"Dans une preuve de terminaison, on exhibe :",choices:["Un invariant","Un variant entier positif strictement décroissant","Un compteur","Une exception"],a:1,ex:"Un variant ne peut pas décroître indéfiniment."},
  {t:"free",q:"Écris le cas de base de l'exponentiation rapide.",sol:"if n == 0:",ex:"x^0 = 1."}]}]},

{slug:"u7",title:"Atelier code",subtitle:"Écrire de vraies fonctions",color:"#FF9600",lessons:[
 {slug:"u7-l1",title:"Premières fonctions",items:[
  {t:"code",q:"Écris une fonction `carre(x)` qui renvoie le carré de x.",starter:"def carre(x):\n    ",tests:[{call:"carre(3)",expect:"9"},{call:"carre(-4)",expect:"16"},{call:"carre(0)",expect:"0"}],sol:"def carre(x):\n    return x * x",ex:"Il suffit de renvoyer x * x."},
  {t:"code",q:"Écris `somme(L)` qui renvoie la somme des éléments, sans utiliser `sum`.",starter:"def somme(L):\n    ",tests:[{call:"somme([1,2,3])",expect:"6"},{call:"somme([])",expect:"0"},{call:"somme([-5,5])",expect:"0"}],sol:"def somme(L):\n    s = 0\n    for x in L:\n        s = s + x\n    return s",ex:"Un accumulateur initialisé à 0, puis une boucle for."},
  {t:"code",q:"Écris `maxi(L)` qui renvoie le plus grand élément, sans utiliser `max`.",starter:"def maxi(L):\n    ",tests:[{call:"maxi([3,9,2])",expect:"9"},{call:"maxi([-1,-7])",expect:"-1"},{call:"maxi([4])",expect:"4"}],sol:"def maxi(L):\n    m = L[0]\n    for x in L:\n        if x > m:\n            m = x\n    return m",ex:"On initialise avec le premier élément, jamais avec 0."},
  {t:"code",q:"Écris `compte(L, x)` qui renvoie le nombre d'occurrences de x dans L.",starter:"def compte(L, x):\n    ",tests:[{call:"compte([1,2,2,3], 2)",expect:"2"},{call:"compte([1,1,1], 5)",expect:"0"}],sol:"def compte(L, x):\n    c = 0\n    for y in L:\n        if y == x:\n            c = c + 1\n    return c",ex:"Un compteur incrémenté à chaque égalité."}]},
 {slug:"u7-l2",title:"Algorithmes classiques",items:[
  {t:"code",q:"Écris `est_premier(n)` qui renvoie True si n est premier.",starter:"def est_premier(n):\n    ",tests:[{call:"est_premier(7)",expect:"True"},{call:"est_premier(1)",expect:"False"},{call:"est_premier(9)",expect:"False"},{call:"est_premier(2)",expect:"True"}],sol:"def est_premier(n):\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d = d + 1\n    return True",ex:"Tester les diviseurs jusqu'à la racine carrée de n suffit."},
  {t:"code",q:"Écris `renverse(s)` qui renvoie la chaîne à l'envers, sans `[::-1]`.",starter:"def renverse(s):\n    ",tests:[{call:"renverse('abc')",expect:"'cba'"},{call:"renverse('')",expect:"''"}],sol:"def renverse(s):\n    r = \"\"\n    for c in s:\n        r = c + r\n    return r",ex:"Chaque caractère est ajouté devant la chaîne construite."},
  {t:"code",q:"Écris `fibo(n)` itérative, avec fibo(0)=0 et fibo(1)=1.",starter:"def fibo(n):\n    ",tests:[{call:"fibo(0)",expect:"0"},{call:"fibo(1)",expect:"1"},{call:"fibo(10)",expect:"55"}],sol:"def fibo(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a",ex:"Deux variables qui glissent : O(n), sans récursion."},
  {t:"code",q:"Écris `dicho(L, x)` qui renvoie l'indice de x dans la liste triée L, ou -1.",starter:"def dicho(L, x):\n    ",tests:[{call:"dicho([1,3,5,7], 5)",expect:"2"},{call:"dicho([1,3,5,7], 4)",expect:"-1"},{call:"dicho([2], 2)",expect:"0"}],sol:"def dicho(L, x):\n    g, d = 0, len(L) - 1\n    while g <= d:\n        m = (g + d) // 2\n        if L[m] == x:\n            return m\n        elif L[m] < x:\n            g = m + 1\n        else:\n            d = m - 1\n    return -1",ex:"Si x est dans L, son indice reste entre g et d."}]}]}
];

const FICHES = [
 ["u1","Types","`int`, `float`, `str`, `bool` — `type(x)` donne le type\nImmuables : int, float, str, tuple\nMutables : list, dict, set\nConversions : `int(s)`, `float(s)`, `str(n)`"],
 ["u1","Opérateurs","`/` flottante, `//` entière, `%` reste, `**` puissance\n`==` égalité, `=` affectation\n`and`, `or`, `not` — priorité : not, puis and, puis or"],
 ["u1","Chaînes","`s[i]`, `s[-1]`, `s[a:b]` (b exclu), `s[::-1]`\n`len(s)`, `s.split()`, `s.lower()`\nUne chaîne est immuable"],
 ["u2","Conditions","`if` / `elif` / `else`, indentation de 4 espaces\nLe premier test vrai gagne, le reste est ignoré"],
 ["u2","Boucle for","`for x in L:` parcourt les éléments\n`for i in range(a, b, pas):` — b exclue\n`enumerate(L)` donne (indice, élément)"],
 ["u2","Boucle while","Pour un nombre d'itérations inconnu\nVérifier que la condition finit par devenir fausse\n`break` sort, `continue` passe au tour suivant\n`a, b = b, a` échange sans variable temporaire"],
 ["u3","Définition","`def f(x, y=2):` — défauts en dernier\nSans `return`, la fonction renvoie `None`"],
 ["u3","Portée","Une variable affectée dans une fonction est locale\n`global x` pour modifier une variable extérieure\nPiège : `def f(L=[])` partage la même liste"],
 ["u3","Récursivité","Un cas de base, puis un appel qui s'en rapproche\nfibo naïf : O(2^n). Mémoïsé : O(n)\nProfondeur de pile limitée autour de 1000"],
 ["u4","Coûts des listes","`append`, `pop()` : O(1) — `pop(0)`, `insert(0,x)` : O(n)\n`x in L` : O(n) — `len(L)` : O(1)\n`L[a:b]` copie, `M = L` non"],
 ["u4","Compréhensions","`[f(x) for x in L if cond]`\nMatrice : `[[0] * n for _ in range(p)]`\nÀ éviter : `[[0] * n] * p`"],
 ["u4","Dictionnaires","`d[k]`, `d.get(k, defaut)`, `d.items()`\nAccès en O(1) moyen\n`set` : pas de doublons, `in` en O(1)"],
 ["u5","Échelle des complexités","O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)"],
 ["u5","Tris","Insertion, sélection : O(n²), en place\nFusion : O(n log n), mémoire O(n)\n`sorted(L)` copie, `L.sort()` en place"],
 ["u5","Dichotomie","Prérequis : tableau trié\n`m = (g + d) // 2` puis réduction de l'intervalle\nO(log n)"],
 ["u6","Piles et files","Pile (LIFO) : `append` puis `pop`\nFile (FIFO) : `deque`, `append` et `popleft`"],
 ["u6","Matrices","`len(M)` lignes, `len(M[0])` colonnes\n`M[i][j]` : ligne i, colonne j"],
 ["u6","Preuves","Terminaison : variant entier positif décroissant\nCorrection : invariant vrai avant, pendant, après"],
 ["u7","Écrire une fonction","Un seul rôle par fonction\nTraiter les cas limites : liste vide, n = 0, négatifs\nTester avec `assert f(3) == 9`"]
];

const GLOSSAIRE = [
 ["Accumulateur","Variable qui cumule un résultat au fil d'une boucle, initialisée avant celle-ci."],
 ["Amorti (coût)","Coût moyen d'une opération sur une longue suite d'appels, même si un appel isolé peut être coûteux."],
 ["Argument","Valeur transmise à une fonction lors de l'appel. Le paramètre est le nom qui la reçoit."],
 ["Complexité","Ordre de grandeur du nombre d'opérations en fonction de la taille de l'entrée."],
 ["Compréhension","Écriture condensée construisant une liste : [f(x) for x in L if cond]."],
 ["Dichotomie","Recherche dans un tableau trié en divisant l'intervalle par deux à chaque étape."],
 ["Diviser pour régner","Découper le problème, résoudre les morceaux, recombiner."],
 ["Effet de bord","Modification durable d'un objet extérieur à la fonction."],
 ["Ensemble","Collection sans doublon ni ordre, appartenance en O(1)."],
 ["File","Structure premier entré, premier sorti. deque en Python."],
 ["Flottant","Nombre à virgule codé de façon approchée : 0.1 + 0.2 ne vaut pas exactement 0.3."],
 ["Immuable","Objet non modifiable après création : int, float, str, tuple."],
 ["Indice","Position d'un élément, à partir de 0. Négatif, il part de la fin."],
 ["Invariant","Propriété vraie avant la boucle et conservée à chaque tour, qui prouve la correction."],
 ["Itérable","Objet parcourable avec for : liste, chaîne, dictionnaire, range."],
 ["Mémoïsation","Mise en cache des résultats d'une fonction pour éviter de les recalculer."],
 ["Modulo","Reste de la division entière, opérateur %."],
 ["Mutable","Objet modifiable en place : list, dict, set."],
 ["Pile","Structure dernier entré, premier sorti. append et pop en Python."],
 ["Portée","Zone du programme où un nom de variable est visible."],
 ["Récursivité","Fonction qui s'appelle elle-même, avec un cas de base pour s'arrêter."],
 ["Référence","Un nom désigne un objet ; deux noms peuvent désigner le même objet."],
 ["Table de hachage","Structure derrière dict et set, accès en temps constant moyen."],
 ["Tranche","Sous-séquence L[a:b:pas], borne droite exclue."],
 ["Tri stable","Tri qui préserve l'ordre relatif des éléments égaux."],
 ["Variant","Quantité entière positive strictement décroissante prouvant qu'une boucle termine."]
];

const COMPLEX = [
 ["Accès L[i]","O(1)","Liste"],["L.append(x)","O(1) amorti","Liste"],["L.pop()","O(1)","Liste"],
 ["L.pop(0)","O(n)","Liste"],["x in L","O(n)","Liste"],["L[a:b]","O(b-a)","Liste"],
 ["d[k], k in d","O(1) moyen","Dictionnaire"],["x in S","O(1) moyen","Ensemble"],
 ["Recherche séquentielle","O(n)","Algorithme"],["Recherche dichotomique","O(log n)","Algorithme"],
 ["Tri par sélection","O(n²)","Tri"],["Tri par insertion","O(n²) au pire","Tri"],
 ["Tri fusion","O(n log n)","Tri"],["sorted / L.sort","O(n log n)","Tri"],
 ["Exponentiation rapide","O(log n)","Algorithme"],["Fibonacci récursif naïf","O(2^n)","Algorithme"],
 ["Fibonacci mémoïsé","O(n)","Algorithme"],["Parcours de matrice n×p","O(n·p)","Algorithme"]
];

const SNIPPETS = [
 ["Lire un fichier ligne à ligne",'with open("f.txt") as f:\n    for ligne in f:\n        print(ligne.strip())'],
 ["Compter les occurrences",'d = {}\nfor x in L:\n    d[x] = d.get(x, 0) + 1'],
 ["Mémoïsation",'from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fibo(n):\n    return n if n < 2 else fibo(n-1) + fibo(n-2)'],
 ["File efficace",'from collections import deque\nf = deque()\nf.append(1)\nx = f.popleft()'],
 ["Tri par clé",'L.sort(key=lambda t: t[1], reverse=True)'],
 ["Matrice nulle p×n",'M = [[0] * n for _ in range(p)]'],
 ["Transposée","T = [[M[i][j] for i in range(len(M))] for j in range(len(M[0]))]"],
 ["Parcours en profondeur",'def dfs(g, s, vus=None):\n    if vus is None:\n        vus = set()\n    vus.add(s)\n    for v in g[s]:\n        if v not in vus:\n            dfs(g, v, vus)\n    return vus'],
 ["Chronométrer",'import time\nt = time.perf_counter()\n# ...\nprint(time.perf_counter() - t)'],
 ["Tester une fonction",'assert carre(3) == 9\nassert carre(-2) == 4\nprint("ok")']
];

const ASTUCES = [
 "Une boucle while sans variant décroissant est une boucle infinie qui s'ignore.",
 "Avant de coder, écris le cas de base et le cas général sur papier.",
 "Un tableau non trié interdit la dichotomie : c'est le piège le plus fréquent en colle.",
 "pop(0) coûte O(n). Pour une file, deque existe.",
 "Initialise le maximum avec le premier élément, jamais avec zéro.",
 "Deux noms peuvent désigner la même liste : M = L ne copie rien.",
 "Une explication claire vaut la moitié des points à l'oral. Verbalise ton invariant.",
 "Teste toujours sur la liste vide et sur un seul élément.",
 "range(a, b) s'arrête à b-1. Compte deux fois avant de valider une borne.",
 "Si ton code marche mais que tu ne sais pas pourquoi, il ne marche pas."
];

function seed(db) {
  const n = db.prepare("SELECT COUNT(*) c FROM units").get().c;
  if (n > 0) return false;

  const iu = db.prepare("INSERT INTO units (slug,title,subtitle,color,position,published) VALUES (?,?,?,?,?,1)");
  const il = db.prepare("INSERT INTO lessons (unit_id,slug,title,items,position,published) VALUES (?,?,?,?,?,1)");
  const ir = db.prepare("INSERT INTO resources (kind,unit_slug,title,body,extra,position) VALUES (?,?,?,?,?,?)");

  db.transaction(() => {
    UNITS.forEach((u, i) => {
      const r = iu.run(u.slug, u.title, u.subtitle, u.color, i);
      u.lessons.forEach((l, j) => il.run(r.lastInsertRowid, l.slug, l.title, JSON.stringify(l.items), j));
    });
    FICHES.forEach((f, i) => ir.run("fiche", f[0], f[1], f[2], "", i));
    GLOSSAIRE.forEach((g, i) => ir.run("glossaire", null, g[0], g[1], "", i));
    COMPLEX.forEach((c, i) => ir.run("complexite", null, c[0], c[1], c[2], i));
    SNIPPETS.forEach((s, i) => ir.run("snippet", null, s[0], s[1], "", i));
    ASTUCES.forEach((a, i) => ir.run("astuce", null, "", a, "", i));
  })();
  return true;
}

module.exports = { seed };
