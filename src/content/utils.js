// Return all possible non-null subset combos from an array
function combinations(array) {
    let combos = new Array(1 << array.length).fill().map(
      (e1, i) => array.filter((e2, j) => i & 1 << j));
    // Filter out null combo
    combos = combos.filter(a => a.length > 0);

    return combos;
  }

const surnameParticles = ['a', 'à', 'af', 'al', 'am', 'aus\'m', 'aus’m', 'av', 'aw', 'ben', 'da', 'dai', 'dal', 'de',
    'de\'', 'de’', 'dei', 'del', 'dela', 'della', 'den', 'der', 'des', 'di', 'do', 'dos', 'du', 'el', 'la', 'las', 
    'le', 'li', 'lo', 'los', 'mac', 'ó', 'of', 'op', 'san', 'st', 'st.', '\'t', '’t', 'te', 'ten', 'ter', 'thoe', 
    'tot', 'van', 'vanden', 'vander', 'vom', 'von', 'y', 'z', 'zu', 'zum', 'zur']

function getNameCombos(nameArray) {
    nameArray = combinations(nameArray);

    // Filter out name combos that only contain surname particles
    function isSubset(arr) {
        return arr.every(val => surnameParticles.includes(val.toLowerCase()));
    }

    return nameArray.filter(combo => !isSubset(combo));
}