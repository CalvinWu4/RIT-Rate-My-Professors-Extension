import { replaceCustomNicknames } from './addedNicknames';
import RMPProfessorData from './rmpprofessordata';

import { getNameCombos } from './utils';

import 'arrive';
import tippy from 'tippy.js';

// Get nicknames from chrome.storage.local set by background
let nicknames;
chrome.storage.local.get(['nicknames'], (result) => {
	nicknames = result.nicknames;
});
let head = document.getElementsByTagName("head")[0];

let csses = ["tippy.css", "light.css", "content.css"];

for (const css of csses) {
	var fileref = document.createElement("link");
	fileref.setAttribute("rel", "stylesheet");
	fileref.setAttribute("type", "text/css");
	fileref.setAttribute("href", browser.runtime.getURL(css));
	head.appendChild(fileref);
}



// Add professor ratings
const urlBase = 'https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=2&wt=json&q=';
const selectors = ['.col-xs-2 [href*="mailto:"]', '[ng-bind-html=\'section.instructor | RMPUrl\'] > a'];
selectors.forEach((selector) => {
	document.arrive(selector, function (target) {
		const fullName = replaceCustomNicknames(this.textContent.trim());
		const splitName = fullName.split(' ');
		const firstName = splitName[0].toLowerCase().trim();
		const lastName = splitName.slice(-1)[0].toLowerCase().trim();
		let middleNames = [];
		let originalMiddleNames = [];
		if (splitName.length > 2) {
			middleNames = [...splitName.slice(1, splitName.length - 1).map((name) => name.toLowerCase().trim())];
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
		GetProfessorRatingNew(`${firstName} ${lastName}`).then((f) => {
			if (f.length == 0) {
				//retry some other names on the list

				//eventually this may be a no professor found situation
			} else if (f.length >= 1) {
				let profData = f[0]
				displaySingleProfRating(target, profData);
			}
		
		})
	});
});

async function GetProfessorRatingNew (searchterm) {
	const query = `query NewSearchTeachersQuery(
    $query: TeacherSearchQuery!
) {
	newSearch {
		teachers(query: $query) {
			didFallback
			edges {
				cursor
				node {
					id
					legacyId
					firstName
					lastName
					avgRatingRounded
					numRatings
					wouldTakeAgainPercentRounded
					wouldTakeAgainCount
					teacherRatingTags {
						id
						legacyId
						tagCount
						tagName
					}
					mostUsefulRating {
						id
						class
						isForOnlineClass
						legacyId
						comment
						helpfulRatingRounded
						ratingTags
						grade
						date
						iWouldTakeAgain
						qualityRating
						difficultyRatingRounded
						teacherNote{
							id
							comment
							createdAt
							class
						}
						thumbsDownTotal
						thumbsUpTotal
					}
					avgDifficultyRounded
					school {
						name
						id
					}
					department
				}
			}
		}
	}
}`;


	const body = JSON.stringify({
		query,
		variables: {
			query: {
				text: searchterm,
				schoolID: 'U2Nob29sLTgwNw==',
			},
		}
	});

	return browser.runtime.sendMessage({
		type: "graphql",
		content: body
	}).then((data) => normalizeGraphQLData(data));
}

function normalizeGraphQLData(data) {
	//remove useless layers
	data = data.data.newSearch.teachers;
	//TODO: dont know what didFallback means in the graphQL API, probably just ignore it
	data = data.edges;
	//
	data = data.map((value) => RMPProfessorData.fromGraphQL(value.node));
	return data;

}


///assumes that there is one prof data object provided
function displaySingleProfRating(element, profData){

	element.setAttribute('target', '_blank');
	element.classList.add('blueText');
	element.parentElement && element.parentElement.classList.add('classSearchBasicResultsText');


	element.textContent += ` (${profData.getRatingString()})`;
	element.setAttribute('href', profData.getURL());

	setupSingleProfToolTip(element, profData);
}

function setupSingleProfToolTip(element, profData) {
	let wouldTakeAgainText;
	let easyRatingText;

	const div = document.createElement('div');
	const title = document.createElement('div');
	title.classList.add('prof-rating-title');
	title.textContent = 'Rate My Professor Details';
	div.appendChild(title);

	const professorText = document.createElement('div');
	professorText.classList.add('prof-rating-text');
	professorText.textContent = `${profData.getFullName()}, Professor in ${profData.department}`;
	div.appendChild(professorText);
	const avgRatingText = document.createElement('div');
	avgRatingText.classList.add('prof-rating-text');
	avgRatingText.textContent = `Overall Quality: ${profData.getRatingString()}/5`;
	div.appendChild(avgRatingText);
	const numRatingsText = document.createElement('div');
	numRatingsText.classList.add('prof-rating-text');
	numRatingsText.textContent = `Number of Ratings: ${profData.ratingsCount}`;
	div.appendChild(numRatingsText);

	

	easyRatingText = document.createElement('div');
	easyRatingText.classList.add('prof-rating-text');
	easyRatingText.textContent = `Level of Difficulty: ${profData.difficultyGPA}`;
	div.appendChild(easyRatingText);
	wouldTakeAgainText = document.createElement('div');
	wouldTakeAgainText.classList.add('prof-rating-text');
	

	wouldTakeAgainText.textContent = `Would take again: ${profData.wouldTakeAgainPercentage}%`;
	div.appendChild(wouldTakeAgainText);
	const topTagsText = document.createElement('div');
	topTagsText.classList.add('prof-rating-text');
	topTagsText.textContent = 'Top Tags: ';
	if (profData.topTags.length > 0) {
		topTagsText.textContent = profData.topTags.join(", ");
		div.appendChild(topTagsText);
	}
	div.appendChild(document.createElement('br'));
	
	if (profData.mostHelpfulRating) {
		const mostHelpfulReview = profData.mostHelpfulRating
		const classText = document.createElement('div');
		classText.classList.add('prof-rating-text');
		classText.textContent = `Most Helpful Rating: ${mostHelpfulReview.course
			}${mostHelpfulReview.isOnlineClass ? ' (Online)' : ''}`; // Mark if class was online
		div.appendChild(classText);
		const dateText = document.createElement('div');
		dateText.classList.add('prof-rating-text');
		dateText.textContent = mostHelpfulReview.date; //TODO: maybe convert to string date
		div.appendChild(dateText);
		const profRating = document.createElement('div');
		profRating.classList.add('prof-rating-text');
		profRating.textContent = `Overall Quality: ${mostHelpfulReview.qualityRating}`;
		div.appendChild(profRating);
		const thisEasyRating = document.createElement('div');
		thisEasyRating.classList.add('prof-rating-text');
		thisEasyRating.textContent = `Level of Difficulty: ${mostHelpfulReview.difficultyRating}`;
		div.appendChild(thisEasyRating);
		if (mostHelpfulReview.rWouldTakeAgain !== 'N/A') {
			const thisWouldTakeAgain = document.createElement('div');
			thisWouldTakeAgain.classList.add('prof-rating-text');
			thisWouldTakeAgain.textContent = `Would take again: ${mostHelpfulReview.iWouldTakeAgain}`;
			div.appendChild(thisWouldTakeAgain);
		}
		const commentText = document.createElement('div');
		commentText.classList.add('prof-rating-text');
		commentText.textContent = mostHelpfulReview.comments;
		div.appendChild(commentText);
		const tagsText = document.createElement('div');
		tagsText.classList.add('prof-rating-text');
		tagsText.textContent = 'Tags: ';
		const tags = mostHelpfulReview.ratingTags;
		if (tags.length > 0) {
			tagsText.textContent = ratingTags;
			div.appendChild(tagsText);
		}
		const upvotesText = document.createElement('div');
		upvotesText.classList.add('prof-rating-text');
		upvotesText.textContent = `👍${mostHelpfulReview.totalThumbsUp} 👎${mostHelpfulReview.totalThumbsDown}`;
		div.appendChild(upvotesText);
	}
	tippy(element, {
		theme: 'light',
		placement: 'right',
		// show delay is 500ms, hide delay is 0ms
		delay: [500, 0],
		content: div
	});
}