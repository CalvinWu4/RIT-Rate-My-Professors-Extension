export default class RMPProfessorData {

	constructor(firstName, middleName, lastName, department, qualityRating, ratingsCount, difficultyGPA, wouldTakeAgainPercentage, topTags, mostHelpfulRating) {
		this.firstName = firstName || "";
		this.middleName = middleName || "";
		this.lastName = lastName || "";
		this.department = department || "";
		this.qualityRating = qualityRating || 0;
		this.ratingsCount = ratingsCount || 0;
		this.difficultyGPA = difficultyGPA || 0.0;
		this.wouldTakeAgainPercentage = wouldTakeAgainPercentage || 0;
		this.topTags = topTags || [];
		this.mostHelpfulRating = mostHelpfulRating;
	}


	fromGraphQL(data) {

	}
	
}