import {filterNonProfessors} from '../../src/content/utils.mjs';
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

