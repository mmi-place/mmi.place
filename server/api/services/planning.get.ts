import { prisma } from "~~/server/utils/db";
import type { Course as EditedCourse } from "~~/prisma/generated/client";

import { Timetable } from "celcat";
import type { Course } from "celcat";

const groups: Record<string, string> = {
	MMI1_A1: "G1-QJ2DMFYC5987",
	MMI1_A2: "G1-PW2GUKMM5988",
	MMI1_B1: "G1-HN2CHYNX5990",
	MMI1_B2: "G1-QW2SJTJH5991",
	MMI2_A1: "G1-QS2QEJVB5994",
	MMI2_A2: "G1-EG2LDXAM5995",
	MMI2_B1: "G1-AE2BGJHX5997",
	MMI2_B2: "G1-TM2VJCBU5998",
	MMI3DW_FA_A1: "G1-TS2PGRAD6003",
	MMI3DW_FA_A2: "G1-KL2GMWYW6004",
	MMI3CN_FI_A1: "G1-EB2URAPF6006",
	MMI3CN_FI_A2: "G1-JP2NSAYC6007",
	MMI3CN_FA_A1: "G1-CC2LTGMX6000",
	MMI3CN_FA_A2: "G1-HW2LKCBM6001",
};

export default defineEventHandler(async (event) => {
	const { group, start, end } = getQuery(event);

	if (!group || typeof group !== "string") {
		throw createError({
			statusCode: 400,
			message: "Group query parameter is required and must be a string.",
		});
	}

	const groupId = groups[group as keyof typeof groups];

	if (!groupId) {
		throw createError({
			statusCode: 400,
			message: "Invalid group query parameter.",
		});
	}

	const tt = new Timetable(process.env.CELCAT_URL);

	const courses = await prisma.course.findMany();

	const editedCourses: EditedCourse[] = courses.map((course: EditedCourse) => ({
		uid: course.uid,
		type: course.type,
		summary: course.summary,
		startDate: course.startDate,
		endDate: course.endDate,
		teachers: course.teachers,
		location: course.location,
		module: course.module,
	}));

	const ogCourses = await tt.getTimetable(
		groupId,
		new Date(start as string) || new Date(),
		end ? new Date(end as string) : undefined,
	);

	let result: Course[] = [];

	ogCourses.forEach((course) => {
		if (course.start < new Date()) return;

		const editedCourse = editedCourses.find(
			(ec) => ec.uid === course.uid,
		);

		result.push({
			uid: course.uid,
			type: editedCourse?.type || course.type,
			summary: editedCourse?.summary || course.summary,
			start: editedCourse?.startDate || course.start,
			end: editedCourse?.endDate || course.end,
			teachers: editedCourse?.teachers || course.teachers,
			location: editedCourse?.location || course.location,
			module: editedCourse?.module || course.module,
		});
	});

	return result;
});
