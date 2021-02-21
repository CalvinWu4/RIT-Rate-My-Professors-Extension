let nicknames = JSON.parse(localStorage.getItem("nicknames"));

// Refresh nicknames and Airtable records from background fetch
chrome.runtime.onMessage.addListener(function(message) {
    const fetchedNicknames = message.nicknames;
    localStorage.setItem("nicknames", JSON.stringify(fetchedNicknames));
    savedNicknames = JSON.parse(localStorage.getItem("nicknames"));
    });

// Add professor ratings
const urlBase = "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=2&wt=json&q=";
const selectors = ['.col-xs-2 [href*="mailto:"]', `[ng-bind-html='section.instructor | RMPUrl'] > a`];
selectors.forEach(selector => {
    document.arrive(selector, function(){
        const fullName = replaceCustomNicknames(this.textContent);
        const splitName = fullName.split(' ');
        const firstName = splitName[0].toLowerCase().trim();
        const lastName = splitName.slice(-1)[0].toLowerCase().trim();
        let middleNames = [];
        let originalMiddleNames = [];
        if (splitName.length > 2) {
            middleNames = [...splitName.slice(1, splitName.length-1).map(name => name.toLowerCase().trim())];
            originalMiddleNames = [...middleNames];
        }
        // Try with no middle names at first
        const tryMiddleNames = false;
        const tryNicknames = true;
        const tryMiddleAndLastNameCombos = true;
        const originalFirstName = firstName;
        const originalLastName = lastName;
        const nicknamesIndex = 0;
        const middleAndLastNameCombosIndex = 0;
        const tryMiddleNameAsFirst = true;
        // Query Rate My Professor with the professor's name
        GetProfessorRating(this, fullName, lastName, originalLastName, firstName, originalFirstName, middleNames,
            originalMiddleNames, tryNicknames, nicknamesIndex, tryMiddleAndLastNameCombos,
            middleAndLastNameCombosIndex, tryMiddleNameAsFirst, tryMiddleNames);
    });
});

let restoreFirstName = false;
let restoreMiddleNames = false;
function GetProfessorRating(element, fullName, lastName, originalLastName, firstName, originalFirstName, middleNames,
    originalMiddleNames, tryNicknames, nicknamesIndex, tryMiddleAndLastNameCombos, middleAndLastNameCombosIndex, 
    tryMiddleNameAsFirst, tryMiddleNames) {

    const middleNamesString = tryMiddleNames ? middleNames.join('+') : '';
    const schoolName = 'Rochester Institute of Technology';
    const urlBase = 
    "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=2&wt=json&q=";
    url = `${urlBase}${firstName ? firstName + '+' : ''}${middleNamesString === '' ? '' : middleNamesString + "+"}${
        tryMiddleAndLastNameCombos && middleNamesString ? '' : lastName}+AND+schoolname_t:${schoolName}`;
    const middleAndLastNameCombos = getNameCombos(originalMiddleNames.concat(lastName));
    // Restore fields after certain iterations 
    if (restoreFirstName) {
        firstName = originalFirstName;
        restoreFirstName = false;
    }
    if (restoreMiddleNames) {
        middleNames = [...originalMiddleNames];
        restoreMiddleNames = false;
    }

    chrome.runtime.sendMessage({ url: url }, function (response) {
        const json = response.JSONresponse;
        const numFound = json.response.numFound;
        const docs = json.response.docs;
        let doc;
        // Add professor data if found
        if (numFound > 0) {
            doc = docs[0];
            if (doc) {
                const profID = doc.pk_id;
                const realFullName = doc.teacherfullname_s;
                const dept = doc.teacherdepartment_s;
                const profRating = doc.averageratingscore_rf && doc.averageratingscore_rf.toFixed(1);
                const numRatings = doc.total_number_of_ratings_i;
                const easyRating = doc.averageeasyscore_rf && doc.averageeasyscore_rf.toFixed(1);

                const profURL = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + profID;
                element.textContent += ` (${profRating ? profRating : 'N/A'})`;
                element.setAttribute('href', profURL);
                element.setAttribute('target', '_blank');

                let allprofRatingsURL = "https://www.ratemyprofessors.com/paginate/professors/ratings?tid=" + profID +
                "&page=0&max=20";
                AddTooltip(element, allprofRatingsURL, realFullName, profRating, numRatings, easyRating, dept);
            }
        } else {
            // Try again with only the first part of a hyphenated last name
            if (lastName.includes("-")) {
                lastName = lastName.split('-')[0];
                GetProfessorRating(element, fullName, lastName, originalLastName, firstName, originalFirstName, 
                    middleNames, originalMiddleNames, tryNicknames, nicknamesIndex, tryMiddleAndLastNameCombos,
                    middleAndLastNameCombosIndex, tryMiddleNameAsFirst, tryMiddleNames);
            }
            // Try again with different middle and last names combos
            else if (tryMiddleNames && tryMiddleAndLastNameCombos && 
                middleAndLastNameCombos[middleAndLastNameCombosIndex]) {
                middleNames = middleAndLastNameCombos[middleAndLastNameCombosIndex];
                middleAndLastNameCombosIndex++;
                tryMiddleAndLastNameCombos = middleAndLastNameCombos[middleAndLastNameCombosIndex];
                if (!tryMiddleAndLastNameCombos) {
                    restoreMiddleNames = true;
                }
                GetProfessorRating(element, fullName, lastName, originalLastName, firstName, originalFirstName, 
                    middleNames, originalMiddleNames, tryNicknames, nicknamesIndex, tryMiddleAndLastNameCombos,
                    middleAndLastNameCombosIndex, tryMiddleNameAsFirst, tryMiddleNames);
            }
            // Try again with nicknames for the first name
            else if (tryNicknames && savedNicknames[originalFirstName]) {
                firstName = savedNicknames[originalFirstName][nicknamesIndex];
                nicknamesIndex++;
                tryNicknames = savedNicknames[originalFirstName][nicknamesIndex];
                if (!tryNicknames) {
                    restoreFirstName = true;
                }
                GetProfessorRating(element, fullName, lastName, originalLastName, firstName, originalFirstName, 
                    middleNames, originalMiddleNames, tryNicknames, nicknamesIndex, tryMiddleAndLastNameCombos,
                    middleAndLastNameCombosIndex, tryMiddleNameAsFirst, tryMiddleNames);
            }
            // Try again with the middle name as the first name
            else if (tryMiddleNameAsFirst && !tryMiddleNames && originalMiddleNames.length > 0) {
                tryMiddleNameAsFirst = false;
                restoreFirstName = true;
                GetProfessorRating(element, fullName, lastName, originalLastName, firstName, originalFirstName, 
                    middleNames, originalMiddleNames, tryNicknames, nicknamesIndex, tryMiddleAndLastNameCombos,
                    middleAndLastNameCombosIndex, tryMiddleNameAsFirst, tryMiddleNames);
            }
            // Try again with middle names
            else if (!tryMiddleNames && originalMiddleNames.length > 0) {
                tryMiddleNames = true;
                GetProfessorRating(element, fullName, lastName, originalLastName, firstName, originalFirstName, 
                    middleNames, originalMiddleNames, tryNicknames, nicknamesIndex, tryMiddleAndLastNameCombos,
                    middleAndLastNameCombosIndex, tryMiddleNameAsFirst, tryMiddleNames);
            }
            // Set link to search results if not found
            else {
                element.textContent = `${element.textContent} (NF)`;
                element.setAttribute('href', 
                `https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&queryoption=HEADER&query=${
                    originalLastName}&facetSearch=true&schoolName=${schoolName}`);
                element.setAttribute('target', '_blank');
            }
        }        
    });
}

function AddTooltip(element, allprofRatingsURL, realFullName, profRating, numRatings, easyRating, dept) {
    let ratings = [];
    function getRatings(url){
        chrome.runtime.sendMessage({ url: url }, function (response) { 
            ratings = ratings.concat(response.JSONresponse.ratings);
            var remaining = response.JSONresponse.remaining;
            let pageNum = parseInt(new URLSearchParams(url).get('page'));
            if(remaining !== 0) { 
                // Get all ratings by going through all the pages
                getRatings(url.replace(`page=${pageNum}`, `page=${pageNum + 1}`));
            }
            else{
                // Build content for professor tooltip
                let wouldTakeAgain = 0;
                let wouldTakeAgainNACount = 0;
                let mostHelpfulReview;
                let helpCount;
                let notHelpCount;
                let wouldTakeAgainText;
                let easyRatingText;

                const div = document.createElement("div");
                const title = document.createElement("h3");
                title.textContent = "Rate My Professor Details";
                div.appendChild(title);
                const professorText = document.createElement("p");
                professorText.textContent = `${realFullName}, Professor in ${dept}`;
                div.appendChild(professorText);
                const avgRatingText = document.createElement("p");
                avgRatingText.textContent = `Overall Quality: ${profRating ? profRating : 'N/A'}/5`
                div.appendChild(avgRatingText);
                const numRatingsText = document.createElement("p");
                numRatingsText.textContent = `Number of Ratings: ${numRatings}`
                div.appendChild(numRatingsText);

                if (ratings.length > 0) {
                    let tagFreqMap = new Map();
                    for (let i = 0; i < ratings.length; i++) {
                        let rating = ratings[i];
                        if (rating.rWouldTakeAgain === "Yes") {
                            wouldTakeAgain++;
                        } else if (rating.rWouldTakeAgain === "N/A") {
                            wouldTakeAgainNACount++;
                        }

                        let teacherRatingTags = rating.teacherRatingTags;
                        for (let j = 0; j < teacherRatingTags.length; j++) {
                            let tag = teacherRatingTags[j];
                            if (tagFreqMap.get(tag)){
                                tagFreqMap.get(tag).count++;
                            }
                            else{
                                tagFreqMap.set(tag, { count: 0 });
                            }
                        }
                    }

                    ratings.sort(function(a,b) { return new Date(b.rDate) - new Date(a.rDate) });
                    ratings.sort(function(a,b) {
                        return (b.helpCount - b.notHelpCount) - (a.helpCount - a.notHelpCount);
                    });
                    mostHelpfulReview = ratings[0];
                    helpCount = mostHelpfulReview.helpCount;
                    notHelpCount = mostHelpfulReview.notHelpCount;

                    const topTags = ([...tagFreqMap.entries()].sort((a, b) => a.count - b.count)).splice(0, 5);
                    easyRatingText = document.createElement("p");
                    easyRatingText.textContent = `Level of Difficulty: ${easyRating}`;
                    div.appendChild(easyRatingText);
                    wouldTakeAgainText = document.createElement("p");
                    if (ratings.length >= 8 && wouldTakeAgainNACount < (ratings.length / 2)) {
                        wouldTakeAgain = ((wouldTakeAgain / (ratings.length - wouldTakeAgainNACount)) * 100).toFixed(0)
                        .toString() + "%";
                    } else {
                        wouldTakeAgain = "N/A";
                    }
                    wouldTakeAgainText.textContent = "Would take again: " + wouldTakeAgain;
                    div.appendChild(wouldTakeAgainText);
                    const topTagsText = document.createElement("p");
                    topTagsText.textContent = "Top Tags: ";
                    if (topTags.length > 0) {
                        for (let i = 0; i < topTags.length; i++) {
                            let tag = topTags[i][0];
                            topTagsText.textContent += `${tag}${i !== topTags.length - 1 ? ", " : ""}`;
                        }
                        div.appendChild(topTagsText);
                    }
                    div.appendChild(document.createElement("br"));
                }
                if (mostHelpfulReview) {
                    const classText = document.createElement("p");
                    classText.textContent = "Most Helpful Rating: " + mostHelpfulReview.rClass + 
                    (mostHelpfulReview.onlineClass === "online" ? " (Online)" : "");  // Mark if class was online
                    div.appendChild(classText);
                    const dateText = document.createElement("p");
                    dateText.textContent = mostHelpfulReview.rDate;
                    div.appendChild(dateText);
                    const profRating = document.createElement("p");
                    profRating.textContent = "Overall Quality: " + mostHelpfulReview.rOverallString;
                    div.appendChild(profRating);
                    const thisEasyRating = document.createElement("p");
                    thisEasyRating.textContent = "Level of Difficulty: " + mostHelpfulReview.rEasyString;
                    div.appendChild(thisEasyRating);
                    if (mostHelpfulReview.rWouldTakeAgain !== "N/A") {
                        const thisWouldTakeAgain = document.createElement("p");
                        thisWouldTakeAgain.textContent = "Would take again: " + mostHelpfulReview.rWouldTakeAgain;
                        div.appendChild(thisWouldTakeAgain);
                    }
                    const commentText = document.createElement("p");
                    commentText.textContent = mostHelpfulReview.rComments;
                    commentText.classList.add('paragraph');
                    div.appendChild(commentText);
                    const tagsText = document.createElement("p");
                    tagsText.textContent = "Tags: "
                    const tags = mostHelpfulReview.teacherRatingTags;
                    if (tags.length > 0) {
                        for (let i = 0; i < tags.length; i++) {
                            let tag = tags[i];
                            tagsText.textContent += `${tag}${i !== tags.length - 1 ? ", " : ""}`;
                        }
                        div.appendChild(tagsText);
                    }
                    const upvotesText = document.createElement("p");
                    upvotesText.textContent = `👍${helpCount} 👎${notHelpCount}`;
                    div.appendChild(upvotesText);
                }
                element.class = "tooltip";
                element.addEventListener("mouseenter", function () {
                    // Only create tooltip once
                    if (!$(element).hasClass('tooltipstered')) {
                        $(this)
                            .tooltipster({
                                animation: 'grow',
                                theme: 'tooltipster-default',
                                side: 'right',
                                content: div,
                                contentAsHTML: true,
                                maxWidth: 400,
                                delay: 500
                            })
                            .tooltipster('show');
                    }
                });
            }
        });
    }
    getRatings(allprofRatingsURL);
}