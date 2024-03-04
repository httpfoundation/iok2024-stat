import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, CardContent, Card, Typography, Stack, Grid, Button } from "@mui/material"
import { useGetAll } from "./tools/datoCmsTools"
import { CSVExportLink } from "./CSVExportLink"
import XLSXExportButton from "./XLSXExportButton"

const Ratings = () => {
	const _ratings = useGetAll("rating") as Array<{
		id: string, registration: string, ratings: string, createdAt: string, comment: string, recommendedTopic: any
}>
	const regs = useGetAll("registration") as Array<{id: string, name: string, email: string, phone: string, createdAt: string}>
	const talks = useGetAll("talk") as Array<{id: string, title: string, description: string, createdAt: string}>

	const ratings = _ratings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
	console.log({ratings})
	
	const peopleDidRatingRegistrationIds = ratings.map(r => r.registration)
	console.log({peopleDidRatingRegistrationIds})
	const peopleDidRating = regs.filter(r => peopleDidRatingRegistrationIds.includes(r.id))
	console.log({regs})
	console.log({peopleDidRating})
	const peopleDidNotRating = regs.filter(r => !peopleDidRatingRegistrationIds.includes(r.id))
	console.log({peopleDidNotRating})
	
	const recommendedTopics = [] as Array<{recommendedTopic: string, registration: string}>
	const comments = [] as Array<{comment: string, registration: string}>
	const allRatings = {} as Record<string, {sum: number, count: number, talk?: {id: string, title: string}}>

	const regIds = Array.from(new Set(...[ratings.map(r => r.registration)]))
	const lastRatings = regIds.map(rId => ratings.find(r => r.registration === rId))

	lastRatings.map(r => {
		if (!r) return {}
		if (r.comment) comments.push({comment: r.comment, registration: r.registration})
		if (r.recommendedTopic) recommendedTopics.push({recommendedTopic: r.recommendedTopic, registration: r.registration})
		const _rs = JSON.parse(r.ratings)
		Object.keys(_rs).map(talkId => {
			if (!allRatings[talkId]) allRatings[talkId] = {sum: 0, count: 0, talk: talks.find(t => t.id === talkId)}
			allRatings[talkId].sum += _rs[talkId]
			allRatings[talkId].count += 1
		})
	})

	const preparePeopleDidRatingExport = () => {
		return [
      ["ID", "Név", "E-mail", "Telefonszám", "Regisztrálás dátuma"],
      ...peopleDidRating.map((i) => [
        i.id,
        i.name,
        i.email,
        i.phone,
        i.createdAt,
      ]),
    ];
	}

	const preparePeopleDidNotRatingExport = () => {
		return [
      ["ID", "Név", "E-mail", "Telefonszám", "Regisztrálás dátuma"],
      ...peopleDidNotRating.map((i) => [
        i.id,
        i.name,
        i.email,
        i.phone,
        i.createdAt,
      ]),
    ];
	}

	return <>
			<b>{lastRatings.length}</b> beküldött értékelés


			<Box sx={{width: 'auto', mt: 2}}>
			<TableContainer component={Paper}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell sx={{fontWeight: 700}}>Előadás</TableCell>
							<TableCell sx={{fontWeight: 700, textAlign: "right"}}>Értékelések száma</TableCell>
							<TableCell sx={{fontWeight: 700, textAlign: "right"}}>Átlag</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{Object.keys(allRatings).map(k => <TableRow key={k} hover>
							<TableCell>{allRatings[k].talk?.title || k}</TableCell>
							<TableCell sx={{textAlign: "right"}}>{allRatings[k].count}</TableCell>
							<TableCell sx={{textAlign: "right"}}>{Number(allRatings[k].sum/allRatings[k].count).toFixed(2)}</TableCell>
						</TableRow>)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
		<Box sx={{mt: 4}}>Milyen témáról hallanál szívesen a következő konferencián?</Box>
		<Box sx={{mt: 1}}><b>{recommendedTopics.length}</b> értékelés</Box>


		{recommendedTopics.map(c => <Card sx={{my: 2}}>
			<CardContent>
				<Typography variant="h6" sx={{fontSize: 14, color: 'rgba(0,0,0,0.6)'}}>{regs.find(r => r.id == c.registration)?.name} ({c.registration})</Typography>
				<Typography variant="body1">{c.recommendedTopic}</Typography>
			</CardContent>
		</Card>)}

		<Box sx={{mt: 4}}>Megjegyzés, észrevétel, javaslat a konferenciával kapcsolatban</Box>
		<Box sx={{mt: 1}}><b>{comments.length}</b> értékelés<br /></Box>


		{comments.map(c => <Card sx={{my: 2}}>
			<CardContent>
				<Typography variant="h6" sx={{fontSize: 14, color: 'rgba(0,0,0,0.6)'}}>{regs.find(r => r.id == c.registration)?.name} ({c.registration})</Typography>
				<Typography variant="body1">{c.comment}</Typography>
			</CardContent>
		</Card>)}
		<Box>
			<XLSXExportButton filename="iok2024_ertekelok.xlsx" prepareExport={preparePeopleDidRatingExport}>
				Értékelő vendégek exportálása Excel fájlba
			</XLSXExportButton>
		</Box>
		<Box>
			<XLSXExportButton filename="iok2024_nem_ertekelok.xlsx" prepareExport={preparePeopleDidNotRatingExport}>
				Nem értékelő vendégek exportálása Excel fájlba
			</XLSXExportButton>
		</Box>
	</>
}



export default Ratings