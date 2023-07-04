import { filterNonProfessors, replaceCustomNicknames, createProfessorSearchStrings } from './utils.mjs';
import RMPProfessorData from "./rmpprofessordata.mjs"
import browser from "webextension-polyfill";

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
		let profname = filterNonProfessors(target.textContent.trim());
		profname = replaceCustomNicknames(profname);

		searchProfessorByName(profname)
		
	});
});


/**
 * Given a professors name, attempt to look up the correct professor using the RMP API
 * @param {*} name a professors name to look up
 * @param {number} [maxTries=5] the maximum number of API calls to make before giving up
 */
async function searchProfessorByName(name, maxTries=5) {

	// split and standardize the casing in the name
	const splitName = name.split(' ').map((part) => part.toLowerCase().trim());
	
	let searchStrings = createProfessorSearchStrings(splitName)
	searchStrings = searchStrings.slice(0, maxTries)

}

function linkProfessor(element, results, lastName, schoolId) {
	element.setAttribute('target', '_blank');
	element.classList.add('blueText');
	element.parentElement && element.parentElement.classList.add('classSearchBasicResultsText');


	if (results.length == 0) {
		//not found
		element.textContent += ` (NF)`;
		element.setAttribute('href', `https://www.ratemyprofessors.com/search/professors?q=${lastName}&sid=${schoolId}`);
		
	} else if (results.length >= 1) {
		let profData = results[0]
		//if found
		element.textContent += ` (${profData.getQualityRatingString()})`;
		element.setAttribute('href', profData.getURL());

		setupSingleProfToolTip(element, profData);
	}

}

/**
 * perform a single query to RateMyProfessors
 * @param {string} searchterm the search term to use (usually a professor's name)
 * @param {string} schoolId the ID of the school to limit the search to (i.e. 'U2Nob29sLTgwNw==')
 * @returns a promise that returns a list of RMPProfessorData objects
 */
async function GetProfessorRating(searchterm, schoolId) {
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

	const queryVars = {
		text: searchterm,
	}

	if (schoolId) {
		queryVars.schoolID = schoolId
	}

	const body = JSON.stringify({
		query,
		variables: {
			query: queryVars,
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

function createToolTipElement(textContent, isTitle = false) {
	const tooltipElement = document.createElement('div');

	tooltipElement.classList.add(isTitle ? 'prof-rating-title' : 'prof-rating-text');

	tooltipElement.textContent = textContent;
	return tooltipElement
}

function setupSingleProfToolTip(element, profData) {

	const div = document.createElement('div');
	div.appendChild(
		createToolTipElement('Rate My Professor Details', true)
	);

	div.appendChild(
		createToolTipElement(`${profData.getFullName()}, Professor in ${profData.department}`)
	);

	div.appendChild(
		createToolTipElement(`Overall Quality: ${profData.getQualityRatingString("-")}/5`)
	);
	
	div.appendChild(
		createToolTipElement(`Number of Ratings: ${profData.ratingsCount}`)
	);

	div.appendChild(
		createToolTipElement(`Level of Difficulty: ${profData.difficultyGPA}`)
	);

	div.appendChild(
		createToolTipElement(`Would take again: ${profData.wouldTakeAgainPercentage ?? "N/A"}%`)
	);

	let topTagsText = 'Top Tags: '; 
	if (profData.topTags.length > 0) {
		topTagsText += profData.topTags.join(", ");
		div.appendChild(
			createToolTipElement(topTagsText)
		);
	}

	div.appendChild(document.createElement('br'));

	if (profData.mostHelpfulRating) {
		const mostHelpfulReview = profData.mostHelpfulRating
		// Mark if class was online
		div.appendChild(
			createToolTipElement(`Most Helpful Rating: ${mostHelpfulReview.course
				}${mostHelpfulReview.isOnlineClass ? ' (Online)' : ''}`)
		);
		
		div.appendChild(
			createToolTipElement(mostHelpfulReview.date.toLocaleDateString())
		);
		
		div.appendChild(
			createToolTipElement(`Overall Quality: ${mostHelpfulReview.qualityRating}`)
		);

		div.appendChild(
			createToolTipElement(`Level of Difficulty: ${mostHelpfulReview.difficultyRating}`)
		);

		if (mostHelpfulReview.iWouldTakeAgain) {
			div.appendChild(
				createToolTipElement(`Would take again: ${mostHelpfulReview.iWouldTakeAgain ? "Yes" : "No"}`)
			);
		}

		div.appendChild(
			createToolTipElement(mostHelpfulReview.comments)
		);

		if (mostHelpfulReview.ratingTags !== "") {
			div.appendChild(
				createToolTipElement('Tags: ' + mostHelpfulReview.ratingTags)
			);
		}

		div.appendChild(
			createToolTipElement(`👍${mostHelpfulReview.totalThumbsUp} 👎${mostHelpfulReview.totalThumbsDown}`)
		);
	}
	tippy(element, {
		theme: 'light',
		placement: 'right',
		// show delay is 500ms, hide delay is 0ms
		delay: [500, 0],
		content: div
	});
}