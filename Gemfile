source 'https://rubygems.org'

require 'json'
require 'open-uri'
versions = JSON.parse(open('https://pages.github.com/versions.json').read)

# gem 'github-pages', versions['github-pages']

# test jekyll 3 version
gem "github-pages", github: "github/pages-gem", branch: "jekyll-3"

group :development do
    gem 'foreman'
end

group :test do
    gem 'rake'
    # gem 'jekyll' versions['jekyll']
    gem 'html-proofer'
end
