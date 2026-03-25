
export type Settings = {
	appearence: {
		theme: "light" | "dark";
		contrast: "normal" | "high";
		text: {
			size: "small" | "medium" | "large";
			dyslexia: boolean;
		};
	};
	customization: {
		links: {
			name: string;
			url: string;
		}[];
		sectionOrders: ('students' | 'official' | 'resource')[];
	};
	widgets: {
		carrousel: boolean;
		carrouselRate: number;
		messages: {
			enabled: boolean;
			channels: (number | string)[];
			readMessages: number[];
		};
		vencat: {
			enabled: boolean;
			group: string | null;
		};
		planup: {
			enabled: boolean;
			group: string | null;
			tasks: {
				status: "todo" | "in-progress" | "done";
				tags: number[];
			}[];
			tags: {
				id: number;
				title: string;
				color: string;
			}[];
		};
	};
};
