import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";
import type { Category as ToolCategory, Role } from "./generated/enums";

type SeedAuthor = {
	username: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	role: Role;
};

type SeedTool = {
	name: string;
	url: string;
	source: string | null;
	description: string;
	category: ToolCategory;
	emoji: string;
	authors: SeedAuthor[];
};

const initialAuthors: SeedAuthor[] = [
	{
		username: "bastian.noel",
		name: "Bastian Noël",
		firstName: "Bastian",
		lastName: "NOËL",
		email: "bastian.noel@ens.uvsq.fr",
		role: "ADMIN",
	},
	{
		username: "rayan.ansar",
		name: "Rayan Ansar",
		firstName: "Rayan",
		lastName: "ANSAR",
		email: "rayan.ansar@ens.uvsq.fr",
		role: "CONTRIBUTOR",
	},
	{
		username: "loan.jean",
		name: "Loan Jean",
		firstName: "Loan",
		lastName: "JEAN",
		email: "loan.jean@ens.uvsq.fr",
		role: "ADMIN",
	},
];

const loan = initialAuthors.find((author) => author.username === "loan.jean");
const rayan = initialAuthors.find((author) => author.username === "rayan.ansar");
const bastian = initialAuthors.find((author) => author.username === "bastian.noel");

if (!loan || !rayan || !bastian) {
	throw new Error("Seed authors not found in initialAuthors.");
}

const initialData: SeedTool[] = [
	{
		name: "UVSQ",
		url: "https://www.uvsq.fr",
		source: null,
		description:
			"Portail étudiant regroupant toutes les rubriques importantes.",
		category: "OFFICIAL",
		emoji: "🏠",
		authors: [],
	},
	{
		name: "CELCAT",
		url: "https://edt.rambouillet.iut-velizy.uvsq.fr/cal?vt=agendaWeek&et=room",
		source: null,
		description:
			"Emploi du temps officiel, mis à jour par l'administration.",
		category: "OFFICIAL",
		emoji: "🗓️",
		authors: [],
	},
	{
		name: "eCampus",
		url: "https://ecampus.paris-saclay.fr/",
		source: null,
		description: "Plateforme de cours en ligne, avec ressources et rendus.",
		category: "OFFICIAL",
		emoji: "💻",
		authors: [],
	},
	{
		name: "Partage",
		url: "https://partage.uvsq.fr/",
		source: null,
		description: "Service principal de messagerie SMTP (mail) de l'UVSQ.",
		category: "OFFICIAL",
		emoji: "📧",
		authors: [],
	},
	{
		name: "Bulletins",
		url: "https://bulletins.iut-velizy.uvsq.fr/",
		source: null,
		description:
			"Bulletins de notes officiels, avec détails des évaluations.",
		category: "OFFICIAL",
		emoji: "📋",
		authors: [],
	},
	{
		name: "PStage",
		url: "https://pstage.uvsq.fr/esup-pstage/stylesheets/stage/",
		source: null,
		description:
			"Plateforme de gestion des stages, avec suivi administratif.",
		category: "OFFICIAL",
		emoji: "🎓",
		authors: [],
	},
	{
		name: "Vencat",
		url: "https://vencat.mmi.codes/",
		source: "https://github.com/MMI-CODES/vencat/",
		description:
			"Planning ergonomique et intuitif avec des fonctionnalités avancées.",
		category: "STUDENTS",
		emoji: "🗓️",
		authors: [loan],
	},
	{
		name: "PlanUP",
		url: "https://planup.mmi.codes/",
		source: "https://github.com/MMI-CODES/plan-up/",
		description:
			"Liste des projets à rendre et des DS, tenue à jour par les étudiants.",
		category: "STUDENTS",
		emoji: "📜",
		authors: [loan, rayan],
	},
	{
		name: "IDE MMI",
		url: "https://ide.mmi.codes/",
		source: "https://github.com/MMI-CODES/ide-mmi/",
		description:
			"Environnement en ligne pour Java et Python sans installation.",
		category: "STUDENTS",
		emoji: "💻",
		authors: [bastian],
	},
	{
		name: "Acheter Adobe CC",
		url: "https://creative.academicsoftware.com/fr/velizy",
		source: null,
		category: "RESOURCE",
		description:
			"Lien officiel pour acheter Adobe CC avec la réduc étudiants.",
		emoji: "✍🏼",
		authors: [],
	},
	{
		name: "Tuto cPanel",
		url: "https://youtu.be/iPS25YbKX-8",
		source: null,
		category: "RESOURCE",
		description: "Tutoriel vidéo pour publier un site sur cPanel.",
		emoji: "🌐",
		authors: [bastian],
	},
];

const initialChannels = [
	{
		id: 0,
		title: "Général",
		description: "Canal principal pour les annonces générales.",
		createdAt: new Date(),
	},
	{
		id: 1,
		title: "IUT",
		description: "Canal pour les annonces spécifiques à l'IUT.",
		createdAt: new Date(),
	},
	{
		id: 2,
		title: "BDE",
		description: "Canal pour les annonces du BDE.",
		createdAt: new Date(),
	},
];

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
	for (const author of initialAuthors) {
		await prisma.user.upsert({
			where: { email: author.email || "" },
			update: {},
			create: author,
		});
	}

	for (const channel of initialChannels) {
		await prisma.channel.upsert({
			where: { id: channel.id },
			update: {},
			create: channel,
		});
	}

	for (const tool of initialData) {
		const authorConnections = tool.authors
			.map((author) => ({ email: author.email }));

		await prisma.tool.upsert({
			where: { name: tool.name },
			update: {
				url: tool.url,
				source: tool.source,
				description: tool.description,
				category: tool.category,
				emoji: tool.emoji,
				...(authorConnections.length
					? {
							authors: {
								set: [],
								connect: authorConnections,
							},
						}
					: { authors: { set: [] } }),
			},
			create: {
				name: tool.name,
				url: tool.url,
				source: tool.source,
				description: tool.description,
				category: tool.category,
				emoji: tool.emoji,
				...(authorConnections.length
					? {
							authors: {
								connect: authorConnections,
							},
						}
					: {}),
			},
		});
	}
}

main()
	.catch((e) => {
		console.error(e);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
