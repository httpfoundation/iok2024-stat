import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, CardContent, Card, Typography, Stack, Grid, Button } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useGetAll } from "./tools/datoCmsTools"
// @ts-ignore
import { CSVLink } from "react-csv"
import XLSXExportButton from "./XLSXExportButton"
import AttendanceChart from "./AttendanceChart"

type Attendance = {
	id: string,
	date: string,
	path: string,
}

const notOlderThan = (date: string, minutes: number) => {
	const now = new Date()
	const then = new Date(date)
	return now.getTime() - then.getTime() < minutes * 60 * 1000
}

const formatDate = (date: string|Date) => {
	const d = new Date(date)
	return d.toLocaleTimeString('hu-HU', {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	})
}

type Registration = {
	id: string,
	name: string,
	email: string,
	phone: string,
	workplace: string,
	title: string,
	onsite: string,
	stage: string,
	vipCode: string,
	registrationFeedback: string,
	translation: string,
	createdAt: string,
	newsletter: string;
}

const VisitorCount = () => {
	const [refreshKey, setRefreshKey] = useState(0)
	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(new Date())
	const _attendances = useGetAll("attendance", refreshKey)
	const registrations: Registration[]  = useGetAll("registration", refreshKey)
	const talks: any[] = useGetAll("talk", refreshKey);

  const startingTime = useMemo(
    () =>
      new Date(
        talks.sort(
          (a, z) => new Date(a.start).getTime() - new Date(z.start).getTime()
        )[0]?.start
      ),
    [talks]
  );
  const endingTime = useMemo(
    () =>
      new Date(
        talks.sort(
          (a, z) => new Date(z.end).getTime() - new Date(a.end).getTime()
        )[0]?.end
      ),
    [talks]
  );

	useEffect(() => {
		const interval = window.setInterval(() => {
			console.log("Refreshing")
			setRefreshKey(k => k + 1)
			setLastUpdatedAt(new Date())
		}, 1000 * 60 * 2)
		return () => window.clearInterval(interval)
	}, [])

	const last5Min = {} as Record<string, number>
	let last5MinCount = 0

	const attendances = _attendances.map((a: any) => {
		return  registrations.find(r => r.id === a.registration)
	})

	const groupedAttendances = useMemo(() => {
    const iddAttendances = ((_attendances as any[]) || [])
      .flatMap((attendance) =>
        JSON.parse(attendance?.attendances || '[]').flatMap((a: any) => ({
          ...a,
          id: attendance.registration,
        }))
      )
      .filter((attendance) => attendance.path.startsWith("/szekcio"));

		const groupped = (Object as any).groupBy(iddAttendances, (attendance: any) => attendance.path);

		const res: Record<string, any[]> = {};
		for (const i in groupped) {
			res[i] = groupped[i].filter(
				(x:any, idx:number) => groupped[i].findIndex((i: any) => i.id === x.id) === idx
			);
		}

		return res;
  }, [_attendances]);

	const groupedAttendancesDuringTheConf = useMemo(() => {
    const iddAttendances = ((_attendances as any[]) || [])
      .flatMap((attendance) =>
        JSON.parse(attendance?.attendances || '[]').flatMap((a: any) => ({
          ...a,
          id: attendance.registration,
        }))
      )
			.filter((attendance) => {
				const date = new Date(attendance.date);

				return (
					date.getTime() > startingTime.getTime() - 1000 * 60 * 60 &&
					date.getTime() < endingTime.getTime() + 1000 * 60 * 60
				);
			})
      .filter((attendance) => attendance.path.startsWith("/szekcio"));

		const groupped = (Object as any).groupBy(iddAttendances, (attendance: any) => attendance.path);

		const res: Record<string, any[]> = {};
		for (const i in groupped) {
			res[i] = groupped[i].filter(
				(x:any, idx:number) => groupped[i].findIndex((i: any) => i.id === x.id) === idx
			);
		}

		return res;
  }, [_attendances, startingTime, endingTime]);

	const summedAttendances = useMemo(() => {
    return ((_attendances as any[]) || [])
      .flatMap((attendance) =>
        JSON.parse(attendance?.attendances || "[]").flatMap((a: any) => ({
          ...a,
          id: attendance.registration,
        }))
      )
      .filter((attendance) => attendance.path.startsWith("/szekcio"))
      .filter(
        (x: any, idx: number, arr: any[]) =>
          arr.findIndex((i: any) => i.id === x.id) === idx
      )
			.length;
  }, [_attendances]);

	const summedAttendancesDuringTheConf = useMemo(() => {
    return ((_attendances as any[]) || [])
      .flatMap((attendance) =>
        JSON.parse(attendance?.attendances || "[]").flatMap((a: any) => ({
          ...a,
          id: attendance.registration,
        }))
      )
			.filter((attendance) => {
				const date = new Date(attendance.date);

				return (
					date.getTime() > startingTime.getTime() - 1000 * 60 * 60 &&
					date.getTime() < endingTime.getTime() + 1000 * 60 * 60
				);
			})
      .filter((attendance) => attendance.path.startsWith("/szekcio"))
      .filter(
        (x: any, idx: number, arr: any[]) =>
          arr.findIndex((i: any) => i.id === x.id) === idx
      )
			.length;
  }, [_attendances, startingTime, endingTime]);

	const logEntries = _attendances.map((a: any) => {
		const list = JSON.parse(a.attendances) as {date: string, path: string}[]
		//console.log("a", a)
		const last = list[list.length - 1]
		if (last && notOlderThan(last.date, 5)) {
			last5Min[last.path] = (last5Min[last.path] || 0) + 1
			last5MinCount += 1
		}
		const name = registrations.find(r => r.id === a.registration)?.name
		return list.map((b: any) => ({id: a.registration, name: name, date: b.date, path: b.path}))
	}).flat() as Attendance[]

	const prepareOnlineAttendeesForExport = () => {
		return [
      ["ID", "Név", "E-mail", "Telefonszám", "Munkahely", "Onsite", "Szekció", "VIP Kód", "Regisztráció visszajelzés", "Fordítás", "Hírlevél", "Regisztrálás dátuma"],
      ...attendances.filter(Boolean).map((i) => [
        i!.id,
        i!.name,
        i!.email,
        i!.phone,
        i!.workplace,
        i!.onsite,
        i!.stage,
        i!.vipCode,
        i!.registrationFeedback,
        i!.translation,
        i!.newsletter,
        i!.createdAt,
      ]),
    ];
	}

	const headers = [
		{ label: "id", key: "id" },
		{ label: "name", key: "name" },
		{ label: "email", key: "email" },
		{ label: "phone", key: "phone" },
		{ label: "workplace", key: "workplace" },
		{ label: "title", key: "title" },
		{ label: "onsite", key: "onsite" },
		{ label: "stage", key: "stage" },
		{ label: "vipCode", key: "vipCode" },
		{ label: "registrationFeedback", key: "registrationFeedback" },
		{ label: "translation", key: "translation" },
		{ label: "createdAt", key: "createdAt" },
	  ]


	
	const registrationsForExport = attendances.map((a: any) => {
		return a ?? {}
	})

	
	const csvReport = {
		data: registrationsForExport,
		headers: headers,
		filename: 'edunext2022_online_resztvevok.csv'
	  };

	const stages = {
		"/szekcio/plenaris": "Plenáris",
		"/szekcio/szakkepzes-itmp-netacad": "Szakkepzés, ITMP, Netacad",
		"/szekcio/digitalis-kultura": "Digitalis kultúra",
		"/szekcio/it-felsooktatas": "IT felsőoktatás",
	} as Record<string, string>

	//console.log(attendances)
	/*
	const sql = attendances.reduce((acc, a) => {
		const date = a.date
		const path = a.path
		return `${acc}\nINSERT INTO log (registration, date, path) VALUES (${a.id}, '${date.replace("T", " ").slice(0, 19)}', '${path}');`
	}, "")

	console.log(sql)
	*/
	return <>
		{_attendances.length} online résztvevő - {logEntries.length} log bejegyzés

		<div style={{marginTop: "1rem", marginBottom: "1rem"}}>
			<XLSXExportButton filename="iok2024-online-resztvevok.xlsx" prepareExport={prepareOnlineAttendeesForExport} sx={{ mt:0 }}>
				Online résztvevők exportálása Excel fájlba
			</XLSXExportButton>
		</div>

		<Box sx={{mb: 0.5}}><b>{last5MinCount} aktív néző</b> (utolsó 5 percben)</Box>
		<Box sx={{mb: 0.5}}><b>{summedAttendancesDuringTheConf} aktív néző</b> (a konferencia alatt)</Box>
		<Box sx={{mb: 2}}><b>{summedAttendances} aktív néző</b> (összesen)</Box>

		<Box sx={{mb: 2}}>Utoljára frissítve: {lastUpdatedAt ? formatDate(lastUpdatedAt).slice(0,5) : null}</Box>

		<Typography variant="h5" sx={{fontWeight:'bold',mb:1}}>Utolsó 5 percben:</Typography>
		<Grid container spacing={2} sx={{mb: 4}}>
			{Object.keys(stages).map((k, i) => <Grid item xs>
				<Card key={i} sx={{height: '100%'}}>
					<CardContent>
						<Typography sx={{ fontSize: 14 }} gutterBottom>
							{stages[k]}
						</Typography>
						<Typography variant="h5" component="div">
							<b>{last5Min[k] || 0}</b> <span style={{fontSize: 20, fontWeight: 500}}>néző</span>
						</Typography>
					</CardContent>
				</Card>
			</Grid>)}
		</Grid>

		<Typography variant="h5" sx={{fontWeight:'bold',mb:1}}>A konferencia alatt:</Typography>
		<Grid container spacing={2} sx={{mb: 4}}>
			{Object.keys(stages).map((k, i) => <Grid item xs>
				<Card key={i} sx={{height: '100%'}}>
					<CardContent>
						<Typography sx={{ fontSize: 14 }} gutterBottom>
							{stages[k]}
						</Typography>
						<Typography variant="h5" component="div">
							<b>{groupedAttendancesDuringTheConf[k]?.length || 0}</b> <span style={{fontSize: 20, fontWeight: 500}}>néző</span>
						</Typography>
					</CardContent>
				</Card>
			</Grid>)}
		</Grid>

		<Typography variant="h5" sx={{fontWeight:'bold',mb:1}}>Összesen:</Typography>
		<Grid container spacing={2} sx={{mb: 4}}>
			{Object.keys(stages).map((k, i) => <Grid item xs>
				<Card key={i} sx={{height: '100%'}}>
					<CardContent>
						<Typography sx={{ fontSize: 14 }} gutterBottom>
							{stages[k]}
						</Typography>
						<Typography variant="h5" component="div">
							<b>{groupedAttendances[k]?.length || 0}</b> <span style={{fontSize: 20, fontWeight: 500}}>néző</span>
						</Typography>
					</CardContent>
				</Card>
			</Grid>)}
		</Grid>

		<Box sx={{width: '600px'}}>
			<TableContainer component={Paper}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell sx={{fontWeight: 700}}>URL</TableCell>
							<TableCell sx={{fontWeight: 700, textAlign: "right"}}>Nézőszám (5 min)</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{Object.keys(last5Min).map(k => <TableRow key={k}>
							<TableCell>{k}</TableCell>
							<TableCell sx={{textAlign: "right"}}>{last5Min[k]}</TableCell>
						</TableRow>)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
		
		<Paper sx={{ mt: 4, p: 1 }} elevation={2}>
			<AttendanceChart endingTime={endingTime} startingTime={startingTime} />
		</Paper>
	</>
}

export default VisitorCount