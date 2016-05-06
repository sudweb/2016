FROM ruby

RUN  curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN  apt-get update
RUN  apt-get install -y --no-install-recommends build-essential git nodejs \
     && apt-get clean \
     && rm -rf /var/lib/apt/lists/

RUN  gem install bundler --no-rdoc --no-ri

RUN  git clone https://github.com/rbenv/rbenv.git ~/.rbenv --depth=5 && cd ~/.rbenv && src/configure && make -C src \
     && git clone --depth=5 https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build

RUN  echo "eval \"\$(rbenv init -)\"" >> $HOME/.profile
RUN  echo "eval \"\$(rbenv init -)\"" >> $HOME/.bashrc

ENV  PATH $PATH:/root/.rbenv/bin
RUN  eval "$(rbenv init -)"
COPY .ruby-version ./
RUN  rbenv install
COPY Gemfil* ./
RUN  bundle install

VOLUME /sudweb
ENV LANG C.UTF-8

EXPOSE 4000

ENTRYPOINT  tail -n1 /etc/hosts && cd /sudweb && bundle exec foreman start
