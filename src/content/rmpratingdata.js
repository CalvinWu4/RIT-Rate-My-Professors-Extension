export default class RMPRatingData {

	constructor(date, course, qualityRating, difficultyRating, comments, totalThumbsUp, totalThumbsDown) {
		this.date = date || new Date(1970,1,1);
		this.course = course || "";
		this.qualityRating = qualityRating || 0;
		this.difficultyRating = difficultyRating || 0;
		this.comments = comments || "";
		this.totalThumbsUp = totalThumbsUp || 0;
		this.totalThumbsDown = totalThumbsDown || 0;
	}


	fromGraphQL(data) {

	}
	
}