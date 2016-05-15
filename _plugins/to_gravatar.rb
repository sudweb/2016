require 'digest/md5'

module Jekyll
  module GravatarFilter
    def to_gravatar(input, size=135)
      "https://secure.gravatar.com/avatar/#{hash(input)}?s=#{size}"
    end

    def md5(input)
      hash(input)
    end

    private :hash

    def hash(email)
      email_address = email ? email.downcase.strip : ''
      Digest::MD5.hexdigest(email_address)
    end
  end
end

Liquid::Template.register_filter(Jekyll::GravatarFilter)
