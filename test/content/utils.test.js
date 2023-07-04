import {filterNonProfessors, createProfessorSearchStrings} from '../../src/content/utils.mjs';
import "jest";


describe("filterNonProfessors", () => {
	test("- doesnt change empty string", () => {
		expect(filterNonProfessors("")).toBe("");
	})

	test("- does filter known string ", () => {
		expect(filterNonProfessors("- To Be Determined")).toBe("");
	})

	test("- doesnt filter name", () => {
		expect(filterNonProfessors("Bob Dylan")).toBe("Bob Dylan");
	})
})


// test("createProfessorSearchStrings - produces one string for one component input", () => {
// 	expect(createProfessorSearchStrings(["bob"])).toBe(["bob"]);
// })

test("createProfessorSearchStrings - produces one string for a simple first name and last name input", () => {
	expect(createProfessorSearchStrings(["bob", "smith"])).toEqual(["bob smith"]);
})

test("createProfessorSearchStrings - produces many strings for a first, middle, and last name input", () => {
	expect(createProfessorSearchStrings(["bob", "habjan", "smith"])).toEqual(["bob smith", "habjan smith"]);
})