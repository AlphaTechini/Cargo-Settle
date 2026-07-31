export const shipments = [
	{
		id: 'SHP-2048',
		route: 'New York -> Rotterdam',
		client: 'Atlas Home Imports',
		partners: 4,
		funded: '$24,800',
		status: 'In transit',
		tone: 'info',
		milestone: 'Customs review',
		due: 'Jul 30',
		progress: 68
	},
	{
		id: 'SHP-2059',
		route: 'Shanghai -> Hamburg',
		client: 'Pioneer Retail Group',
		partners: 5,
		funded: '$41,200',
		status: 'Milestone review',
		tone: 'purple',
		milestone: 'Warehouse release',
		due: 'Jul 30',
		progress: 54
	},
	{
		id: 'SHP-2062',
		route: 'Antwerp -> Lagos',
		client: 'Northshore Manufacturing',
		partners: 3,
		funded: '$18,600',
		status: 'Ready to settle',
		tone: 'success',
		milestone: 'Final delivery',
		due: 'Jul 30',
		progress: 92
	},
	{
		id: 'SHP-2071',
		route: 'Miami -> Antwerp',
		client: 'Atlas Home Imports',
		partners: 4,
		funded: '$32,100',
		status: 'Funding gap',
		tone: 'danger',
		milestone: 'Cargo loaded',
		due: 'Jul 31',
		progress: 23
	},
	{
		id: 'SHP-2089',
		route: 'Miami -> Antwerp',
		client: 'Atlas Home Imports',
		partners: 4,
		funded: '$17,200',
		status: 'Awaiting funding',
		tone: 'warning',
		milestone: 'Funding review',
		due: 'Aug 1',
		progress: 0
	},
	{
		id: 'SHP-2091',
		route: 'Lagos -> Durban',
		client: 'Orchid Retail',
		partners: 3,
		funded: '$22,400',
		status: 'Completed',
		tone: 'success',
		milestone: 'Settled',
		due: 'Jul 28',
		progress: 100
	}
];

export const partners = [
	{
		initials: 'AO',
		name: 'Atlantic Ocean Lines',
		type: 'Ocean carrier',
		region: 'North America / Europe',
		balance: '$0',
		status: 'Verified',
		tone: 'success'
	},
	{
		initials: 'RP',
		name: 'Rotterdam Port Services',
		type: 'Port agent',
		region: 'Netherlands',
		balance: 'EURC 12,300',
		status: 'Verified',
		tone: 'success'
	},
	{
		initials: 'ML',
		name: 'Metro Logistics',
		type: 'Trucking',
		region: 'United States',
		balance: '$18,900',
		status: 'Early pay enabled',
		tone: 'purple'
	},
	{
		initials: 'BW',
		name: 'BlueLine Warehousing',
		type: 'Warehouse',
		region: 'Germany',
		balance: 'EURC 4,600',
		status: 'Pending review',
		tone: 'warning'
	}
];

export const settlements = [
	{
		date: 'Jul 29, 09:42',
		id: 'SET-88291',
		shipment: 'SHP-2048',
		recipient: 'Atlantic Ocean Lines',
		amount: '8,000.00 USDC',
		type: 'Milestone payout',
		status: 'Confirmed',
		tone: 'success'
	},
	{
		date: 'Jul 29, 08:18',
		id: 'SET-88284',
		shipment: 'SHP-2062',
		recipient: 'Metro Logistics',
		amount: '6,800.00 USDC',
		type: 'Early payment',
		status: 'Confirmed',
		tone: 'success'
	},
	{
		date: 'Jul 28, 17:05',
		id: 'SET-88217',
		shipment: 'SHP-2059',
		recipient: 'BlueLine Warehousing',
		amount: '3,200.00 EURC',
		type: 'Partner payout',
		status: 'Processing',
		tone: 'info'
	},
	{
		date: 'Jul 28, 14:12',
		id: 'SET-88198',
		shipment: 'SHP-2071',
		recipient: 'Atlantic Ocean Lines',
		amount: '24,000.00 USDC',
		type: 'Carrier payout',
		status: 'Failed',
		tone: 'danger'
	}
];
