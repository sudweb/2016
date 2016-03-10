.participants
  | map({
      ticket_type: .id_ticket,
      # date: .create_date | strptime("%Y-%m-%d %H:%M:%S") | todateiso8601, (only with jq@1.5 which is not available on travis)
      date: .create_date,
      name: (.owner.first_name + " " + .owner.last_name),
      twitter: ((.answers[] | select(.label | test("twitter"; "i")).value | sub("@"; "")) // null),
      code_postal: ((.answers[] | select(.label | test("postal"; "i")).value) // null),
      # email: .answers[] | select(.label | test("email"; "i")).value | md5
    })
