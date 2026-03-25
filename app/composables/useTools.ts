import type { Tool, User } from "~~/prisma/generated/client";

type ToolWithAuthors = Tool & { authors: User[] };

export const useTools = () => {
	const tools = useState<{
		official: ToolWithAuthors[];
		students: ToolWithAuthors[];
		resource: ToolWithAuthors[];
	}>("tools-data", () => {
		return {
			official: [],
			students: [],
			resource: [],
		};
	});

	const loading = useState<boolean>("tools-loading", () => false);
	const error = useState<Error | null>("tools-error", () => null);

	const fetchTools = async () => {
		loading.value = true;
		try {
			const response = await $fetch("/api/tools");

			const data = response as ToolWithAuthors[];

			tools.value.official = data.filter(
				(tool) => tool.category === "OFFICIAL",
			);
			tools.value.students = data.filter(
				(tool) => tool.category === "STUDENTS",
			);
			tools.value.resource = data.filter(
				(tool) => tool.category === "RESOURCE",
			);
		} catch (e) {
			error.value = e as Error;
		} finally {
			loading.value = false;
		}
	};

	return { tools, loading, error, fetchTools };
};
