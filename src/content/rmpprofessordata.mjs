import RMPRatingData from "./rmpratingdata.mjs";

export default class RMPProfessorData {

	constructor(id, legacyID, firstName, middleName, lastName, department, qualityRating, ratingsCount, difficultyGPA, wouldTakeAgainPercentage, wouldTakeAgainCount, topTags, mostHelpfulRating) {
		this.id = id || 0;
		this.legacyID = legacyID || "";
		this.firstName = firstName || "";
		this.middleName = middleName;
		this.lastName = lastName || "";
		this.department = department || "";
		this.qualityRating = qualityRating || 0;
		this.ratingsCount = ratingsCount || 0;
		this.difficultyGPA = difficultyGPA;
		this.wouldTakeAgainCount = wouldTakeAgainCount || 0;
		this.wouldTakeAgainPercentage = wouldTakeAgainPercentage || 0;
		this.topTags = topTags || [];
		this.mostHelpfulRating = mostHelpfulRating;
	}


	static fromGraphQL(data) {
		return new RMPProfessorData(
			data.id,
			data.legacyId,
			data.firstName,
			"",
			data.lastName,
			data.department,
			data.avgRatingRounded,
			data.numRatings,
			data.avgDifficultyRounded,
			data.wouldTakeAgainPercentRounded,
			data.wouldTakeAgainCount,
			data.teacherRatingTags.map((tag) => tag.tagName),
			data.mostUsefulRating ? RMPRatingData.fromGraphQL(data.mostUsefulRating) : undefined,			
		)
	}


	getURL() {
		return "https://www.ratemyprofessors.com/professor/" + this.legacyID
	}

	getQualityRatingString(fallback = "N/A") {
		return this.qualityRating ? this.qualityRating : fallback
	}

	getDifficultyRatingString(fallback="N/A") {
		return this.difficultyGPA ? this.difficultyGPA : fallback
	}
	
	getFullName() {
		return `${this.firstName} ${this.middleName ? ` ${this.middleName} ` : ""} ${this.lastName}`
	}
}