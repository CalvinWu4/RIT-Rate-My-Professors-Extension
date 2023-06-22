import RMPRatingData from "./rmpratingdata";

export default class RMPProfessorData {

	constructor(firstName, middleName, lastName, department, qualityRating, ratingsCount, difficultyGPA, wouldTakeAgainPercentage, wouldTakeAgainCount, topTags, mostHelpfulRating) {
		this.firstName = firstName || "";
		this.middleName = middleName || "";
		this.lastName = lastName || "";
		this.department = department || "";
		this.qualityRating = qualityRating || 0;
		this.ratingsCount = ratingsCount || 0;
		this.difficultyGPA = difficultyGPA || 0.0;
		this.wouldTakeAgainCount = wouldTakeAgainCount || 0;
		this.wouldTakeAgainPercentage = wouldTakeAgainPercentage || 0;
		this.topTags = topTags || [];
		this.mostHelpfulRating = mostHelpfulRating;
	}


	fromGraphQL(data) {
		return new RMPProfessorData(
			data.firstName,
			"",
			data.lastName,
			data.department,
			data.avgRatingRounded,
			data.numRatings,
			data.avgDifficultyRounded,
			data.wouldTakeAgainPercentRounded,
			data.wouldTakeAgainCount,
			data.teacherRatingTags,
			data.mostHelpfulRating ? RMPRatingData.fromGraphQL(data.mostHelpfulRating) : undefined,			
		)
	}
	
}