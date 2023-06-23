import { roundTo } from "./utils.mjs";

export default class RMPRatingData {

	constructor(id, legacyID, date, course, qualityRating, difficultyRating, comments, totalThumbsUp, totalThumbsDown, ratingTags, isOnlineClass, iWouldTakeAgain) {
		this.id = id || 0;
		this.legacyID = legacyID || "";
		this.date = date || new Date(1970,1,1);
		this.course = course || "";
		this.qualityRating = qualityRating || 0;
		this.difficultyRating = difficultyRating || 0;
		this.comments = comments || "";
		this.totalThumbsUp = totalThumbsUp || 0;
		this.totalThumbsDown = totalThumbsDown || 0;
		this.ratingTags = ratingTags;
		this.isOnlineClass = isOnlineClass;
		this.iWouldTakeAgain = iWouldTakeAgain;

	}


	static fromGraphQL(data) {
		return new RMPRatingData(
			data.id,
			data.legacyId,
			data.date,
			data.class,
			roundTo(data.qualityRating,2),
			roundTo(data.difficultyRatingRounded,2),
			data.comment,
			data.thumbsUpTotal,
			data.thumbsDownTotal,
			data.isForOnlineClass
		);
	}
	
}