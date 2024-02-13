var idLookUp = [
  [
    [null, null],
    ["Z6", "Z6="],
    ["bS", "bE="],
    ["cS", "cE="],
    ["o6", "os="],
    ["p6", "ps="],
    ["rS", "rE="],
    ["sS", "sE="],
    ["46", "4s="],
    ["56", "5s="],
  ],
  [
    ["J", "J"],
    ["N", "N"],
    ["R", "R"],
    ["V", "V"],
    ["Z", "Z"],
    ["d", "d"],
    ["h", "h"],
    ["r", "r"],
    ["v", "v"],
    ["z", "z"],
  ],
  [
    ["uK", "uA=="],
    ["ua", "uQ=="],
    ["uq", "ug=="],
    ["u6", "uw=="],
    ["ca", "cQ=="],
    ["cq", "cg=="],
    ["c6", "cw=="],
    ["dK", "dA=="],
    ["da", "dQ=="],
    ["dq", "dg=="],
  ],
  [
    ["x2", "xz"],
    ["yG", "yD"],
    ["yc", "yZ"],
    ["ys", "yp"],
    ["12", "1z"],
    ["2G", "2D"],
    ["2c", "2Z"],
    ["2s", "2p"],
    ["52", "5z"],
    ["6G", "6D"],
  ],
  [
    ["d", "dQ=="],
    ["e", "eQ=="],
    ["f", "fQ=="],
    ["g", "gQ=="],
    ["h", "hQ=="],
    ["i", "iQ=="],
    ["j", "jQ=="],
    ["l", "lw=="],
    ["m", "mw=="],
    ["n", "nw=="],
  ],
  [
    [null, "s="],
    [null, "w="],
    [null, "0="],
    [null, "4="],
    [null, "Q="],
    [null, "U="],
    [null, "Y="],
    [null, "c="],
    [null, "g="],
    [null, "k="],
  ],
]

var uid = getParameter("uid")
var id = convertUIDtoSRSID(uid)

var parent = document.getElementsByClassName("tabs")[0]

if (parent != null && id != null) {
  var id_link = document.createElement("a")
  var id_text = document.createTextNode("Race Profile")
  var id_list_item = document.createElement("li")
  id_link.href = "http://www.simracingsystem.com/srsmember.php?a=" + id
  id_link.appendChild(id_text)
  id_list_item.appendChild(id_link)

  parent.appendChild(id_list_item)
}

function getParameter(parameterName) {
  result = null
  location.search
    .substring(1)
    .split("&")
    .forEach(function (item) {
      var temp = item.split("=")
      if (temp[0] === parameterName) {
        result = decodeURIComponent(temp[1])
      }
    })
  return result
}

function convertUIDtoSRSID(uid) {
  try {
    result = "f"
    for (var i = 0; i < uid.length; i++) {
      if (i < uid.length - 1) {
        // If not last number in uid
        if (i === 4) {
          result += getChar4(
            parseInt(uid.charAt(i)),
            parseInt(uid.charAt(i + 1))
          )
        } else {
          var tmp = idLookUp[i][parseInt(uid.charAt(i))][0]
          if (tmp != null) result += tmp
          else return null
        }
      } else {
        // If last number in uid
        var tmp = idLookUp[i][parseInt(uid.charAt(i))][1]
        if (tmp != null) result += tmp
        else return null
      }
    }
    return result
  } catch (error) {
    console.error(error)
    return null
  }
}

function getChar4(cur, next) {
  result = idLookUp[4][cur][0]

  if (cur < 7) {
    if (next < 4) {
      result += "a"
    } else {
      result += "W"
    }
  } else {
    if (next < 4) {
      result += "6"
    } else {
      result += "2"
    }
  }

  return result
}
