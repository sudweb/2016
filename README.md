# Sud Web 2016

Site internet du cycle de conférences annuel Sud Web, dont la 6e édition aura lieu à Bordeaux les 27 et 28 mai 2016.

[http://sudweb.fr/2016](http://sudweb.fr/2016)

## Pré-requis
Le site est géré via [Github Pages](https://pages.github.com/) et [Jekyll](http://jekyllrb.com/) et nécessite donc Ruby version 2.1.x.

Nous vous recommandons de gérer l'installation de Ruby via [rbenv](http://rbenv.org/).

Sous Mac OS X, vous pouvez utiliser [Homebrew](http://brew.sh/) pour cela
```bash
$ brew install rbenv ruby-build
```
Pour installer la version 2.1.6 de Ruby
```bash
$ rbenv install 2.1.6
```
Pour définir la version utilisée localement pour l'application:
```bash
$ rbenv local 2.1.6
```
Pour vérifier la version de Ruby utilisée :
```bash
rbenv version
ruby 2.1.6
```

## Installation

Si vous n'avez pas déjà cloné le dépot :
```bash
git clone https://github.com/sudweb/2016.git 2016 && cd 2016
```
Si bundler n'est pas installé
```bash
gem install bundler
```
Pour installer toutes les dépendances du projet :
```bash
bundle install
```

## Utilisation

Pour travailler sur le site et surveiller les modifications :
```bash
$ bundle exec foreman start  
```
Le site est maintenant accessible en local à l'adresse http://0.0.0.0:4000/2016/

Pour plus d'information sur l'utilisation de Jekyll, reportez-vous à la [documentation officielle](http://jekyllrb.com/docs/home/).

## Contribution

Pour toute demande, merci de [créer une issue](https://github.com/sudweb/2016/issues/new) sur GitHub.

Si vous souhaitez nous aider, vous pouvez [copier](https://help.github.com/articles/fork-a-repo/) le dépôt, faire vos modifications dans une nouvelle branche, et [faire une demande de fusion](https://github.com/sudweb/2016/pulls).

## Licence

Ce code est publié sous licence MIT.
