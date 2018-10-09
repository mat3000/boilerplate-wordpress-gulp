# babola / badminton / pre-landing (wordpress)

## Composition de l’arbo :

    - .gitignore -> fichier de configuration git
    - Gulpfile.js -> fichier de configuration glup
    - Package.json -> fichier des dépendances node
    - src -> dossier de travail du thème wordpress
      - img/ -> images / photos etc…
        - sprites -> images pour créer le sprite 
    - js/ -> fichiers javascript
    - styles/
      - tools/ -> utilitaires scss
        - fonts/ -> fonts...
        - fonts.scss -> font's mixins
        - responsive.scss -> tout ce qu'il faut pour les grilles ou media queries
        - reset.scss -> suppression des styles par default
        - sprites.scss -> fichier généré automatiquement lors du démarrage de gulp.
      - app.less -> include des differents scss
      - mixins.scss -> mixins scss
      - styles.scss -> styles globaux
    - wordpress -> Dossier de Travail de wordpress ( dossier dans lequel l'url doit pointer )
    - dump : dossier des dumps musql


## Installation :

 1. Installer nodeJS : https://nodejs.org/ 
 2. Aller à la racine du projet (là ou se trouve le fichier Package.json)
 3. Installer les dépendances node : `$ npm i` ou `$ yarn`


## Développement :

 Démarrer le développement: 
 `$ npm start [--no-open] [--no-help] [--mylog]`
 `$ yarn start [--no-open] [--no-help] [--mylog]`
 
 Cela va créer un thème dans ./wordpress/wp-content/themes/NomDuProjet-dev



## distribution :

 Compiler pour la production : 
 `$ npm run dist`
 `$ yarn dist`
 Cela va créer un thème dans ./wordpress/wp-content/themes/NomDuProjet


## configuration de wordpress
 
 editer le fichier ./Gulpfile.js



## Environement de travail :

**Styles :**
-   Utilisation du **LESS** : http://lesscss.org
-   Méthodologie **BEM** & **ABEM :** http://getbem.com/  / https://css-tricks.com/abem-useful-adaptation-bem/
-   Méthodologie **mobile first**

**Javascript :**
-   ES2015 : https://developer.mozilla.org/fr/docs/Web/JavaScript/Language_Resources
-   Webpack (import de fichier js)


## Fonctionnement :

### ABEM + LESS :  

le fonctionnement est similaire à la doc cependant il y a quelques ajustements lié à l’utilisation du LESS :

#### Un fichier less par page
pour avoir un code clair et organisé, on va diviser le css.

home.html :
 
    <div class=‘home’>
      <div class=‘home__content’>
        <div class=‘home__truc’></div>
      </div>
    </div>

home.less :

    .home {…}
    .home__content {…}
    .home__truc {…}

article.html :

    <div class=‘article’>
      <div class=‘article__content’></div>
      <div class=‘article__truc’></div>
    </div>

article.less :

    .article {…}
    .article__content {…}
    .article__truc {…}
  
#### Mixins
Si un style est récurent à plusieurs pages (comme par exemple les styles des boutons, input etc…), ils doivent être mis dans le fichier mixins.less. l’appel de la mixin doit toujours être placé tout en haut de la class pour qu’il puisse être surchargé. Une mixin doit être uniquement appelé en css, jamais dans le html. . Cela permet d'avoir un code plus "maintenable" et éviter d'avoir du html à modifier.

home.html :

    <div class=‘home’>
      <button class=‘home__button’>text</button>
    </div>

mixins.less :

    .button() {
      background: red;
    }
  
home.less :

    .home__button {
      .button();

      color: white;
    }
  

#### Media query
On utilise la mixin breakpoint() (qui se trouve dans ./styles/tools/responsive/)

home.html :

    <div class=‘home’>
      coucou
    </div>
  
home.less :

    .home {  
      background: red;

      @include breakpoint(tablet) {
        background: green;
      }
    }


#### Grid
On utilise la mixin grid() (qui se trouve dans ./styles/tools/responsive/). Ex :

home.html :

    <div class="row">
      <div>colonne gauche</div>
      <div>colonne droite</div>
    </div>
  
home.less :

    .row {  
      @include row($mobile: 12, $tablet: 6);
      @include gutter($mobile: 10px, $tablet: 20px);
    }

---

home.html :

    <div class="row">
      <div class="row__left">colonne gauche</div>
      <div class="row__right">colonne droite</div>
    </div>
  
home.less :

    .row {  
      @include row();
      @include gutter(10px);
    }
    .row__left{
      @include col(3); // ou 20%
    }
    .row__right{
      @include col(9);
    }

---

home.html :

    <div class="row">
      <div class="row__size-fixe">colonne gauche</div>
      <div class="row__size-auto">colonne droite</div>
    </div>

home.less :

    .row {  
      @include row(nowrap);
    }
    .row__size-fixe{
      @include col(150px);
    }
    .row__size-auto{}


---

home.html :

    <div class="row">
      <div class="row__col-offset">colonne gauche</div>
      <div class="row__col">colonne droite</div>
    </div>
  
home.less :

    .row {  
      @include row(4);
    }
    .row__col-offset{
      @include offset(4);
    }
    .row__col{}



#### Mobile first
On commence par développer la version mobile, pour finir par la version desktop. Voici les différentes étapes :

**mobile :** 0px -> 425px

**phablet :** 426px -> 576px

**tablet :** 577px -> 768px

**laptop :** 769px -> 1024px

**desktop :** 1025px -> ∞


home.html :

    <div class=‘home’></div>

home.less :

    .home:before {
      content: ‘mobile’;


      @include breakpoint(‘phablet’) {
        content: ‘phablet’;
      }

      @include breakpoint(tablet) {
        content: ‘tablet’;
      }

      @include breakpoint(‘laptop’) {
        content: ‘laptop’;
      }

      @include breakpoint(‘desktop’) {
        content: ‘desktop’;
      }

    }

#### Séparer les class JS et CSS :
  
home.html :
  
    <button class=‘home__button js__play’>click</button>
  
home.css :
  
    .home__button {
      color: red;
    }

home.js :
  
    document.querySelector('.js__play').addEventListener("click", () => alert('clicked !') );

#### Sprites :
-   Mettre dans le dossier ./img/sprites les images aux formats png (ne pas mettre des noms de fichiers avec des caractères spéciaux ou espace)
-   Le sprite sera automatiquement généré au démarrage de gulp
-   Reste à appeler la mixin less .sprite-nomDuFichier(1); (le 1 correspond à la taille de l’image, 0.5 affichera une image réduite de 50% ). Ex :

 
home.html :

    <div class=’home__twitter’></div>
    <div class=’home__facebook’></div>


home.less

    .home__twitter {
      @include sprite-twitter();
    }
    .home__facebook {
      @include sprite-facebook(.5);
    }
