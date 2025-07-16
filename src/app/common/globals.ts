class User {
    id: number;
    name: string;
    username: string;
    status: string;
    role: string;
    password: string;

  }

  class SiteApplication {
    id: number;
    name: string;
    company_id: number;
    start_date: string;
    single_site: boolean;
    status: string;
    log: any;
    sites: any;
    watchers: any;
  
  }

export class GlobalVars {
    public static org_id: number;
    public static url: string = 'http://192.53.167.179:8080';

    //public static selectedUser: User = null;

    public static company: any = {'name': '',
                                  'contact': '',
                                  'address': '',
                                  'city': '',
                                  'state': '',
                                  'zip': '',
                                  'addr2': '',
                                  'phone': '',
                                  'start_date': '',
                                    };

    public static navPoint: string;
    public static period_end: string;
    public static pe_approved: boolean;

    public static mapZoom: number = 10;
    public static mapCenter: any;
    public static mapOptions: any;
    // public static basemap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    //                                  { maxZoom: 18, attribution: '...' });
    public static bingMapskey: string = 'AtbnqglVZkEBgFD6RbmKGM_0Oql2dMKxk5Kf-eKyLn_rIZhaUxnvBdExbrNFsJD-';

    public static layerControl: any;
    public static mapMode: string = 'Normal';
    public static mapThemes: any;

    public static userId: number;

    public static mapPointData: any;
    public static mapVectorData: any;
    public static userMapData: any;
    public static tileLayers: any;
    public static basicLayers: any;
    public static userLayers: any;
    

    public static tablesView: boolean;
    public static projectsView: boolean;
    public static mapLayers: any = [];

   

    public static contact_types:any = ['primary','technical','billing','engineering','planning','zoning','permitting'];

    public static phone_types:any = ['office','mobile','home','fax'];

    public static email_types:any = ['primary','secondary'];

    public static engineering_types = ['A&E','PE'];

    public static backhaul_types = ['wireless','fiber','cable','other'];

    public static entity_types = ['organization','property','jurisdiction','engineering'];

    public static address_types = ['physical','mailing','billing'];

    public static maxDimensions:any;


    public static States: any =  [
      { name: 'ALABAMA', abbreviation: 'AL', fips: '01'},
      { name: 'ALASKA', abbreviation: 'AK', fips: '02'},
      { name: 'AMERICAN SAMOA', abbreviation: 'AS', fips: '60'},
      { name: 'ARIZONA', abbreviation: 'AZ', fips: '04'},
      { name: 'ARKANSAS', abbreviation: 'AR', fips: '05'},
      { name: 'CALIFORNIA', abbreviation: 'CA', fips: '06'},
      { name: 'COLORADO', abbreviation: 'CO', fips: '08'},
      { name: 'CONNECTICUT', abbreviation: 'CT', fips: '09'},
      { name: 'DELAWARE', abbreviation: 'DE', fips: '10'},
      { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC', fips: '11'},
      { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM', fips: ''},
      { name: 'FLORIDA', abbreviation: 'FL', fips: '12'},
      { name: 'GEORGIA', abbreviation: 'GA', fips: '13'},
      { name: 'GUAM', abbreviation: 'GU', fips: '66'},
      { name: 'HAWAII', abbreviation: 'HI', fips: '15'},
      { name: 'IDAHO', abbreviation: 'ID', fips: '16'},
      { name: 'ILLINOIS', abbreviation: 'IL', fips: '17'},
      { name: 'INDIANA', abbreviation: 'IN', fips: '18'},
      { name: 'IOWA', abbreviation: 'IA', fips: '19'},
      { name: 'KANSAS', abbreviation: 'KS', fips: '20'},
      { name: 'KENTUCKY', abbreviation: 'KY', fips: '21'},
      { name: 'LOUISIANA', abbreviation: 'LA', fips: '22'},
      { name: 'MAINE', abbreviation: 'ME', fips: '23'},
      { name: 'MARSHALL ISLANDS', abbreviation: 'MH', fips: ''},
      { name: 'MARYLAND', abbreviation: 'MD', fips: '24'},
      { name: 'MASSACHUSETTS', abbreviation: 'MA', fips: '25'},
      { name: 'MICHIGAN', abbreviation: 'MI', fips: '26'},
      { name: 'MINNESOTA', abbreviation: 'MN', fips: '27'},
      { name: 'MISSISSIPPI', abbreviation: 'MS', fips: '28'},
      { name: 'MISSOURI', abbreviation: 'MO', fips: '29'},
      { name: 'MONTANA', abbreviation: 'MT', fips: '30'},
      { name: 'NEBRASKA', abbreviation: 'NE', fips: '31'},
      { name: 'NEVADA', abbreviation: 'NV', fips: '32'},
      { name: 'NEW HAMPSHIRE', abbreviation: 'NH', fips: '33'},
      { name: 'NEW JERSEY', abbreviation: 'NJ', fips: '34'},
      { name: 'NEW MEXICO', abbreviation: 'NM', fips: '35'},
      { name: 'NEW YORK', abbreviation: 'NY', fips: '36'},
      { name: 'NORTH CAROLINA', abbreviation: 'NC', fips: '37'},
      { name: 'NORTH DAKOTA', abbreviation: 'ND', fips: '38'},
      { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP', fips: ''},
      { name: 'OHIO', abbreviation: 'OH', fips: '39'},
      { name: 'OKLAHOMA', abbreviation: 'OK', fips: '40'},
      { name: 'OREGON', abbreviation: 'OR', fips: '41'},
      { name: 'PALAU', abbreviation: 'PW', fips: ''},
      { name: 'PENNSYLVANIA', abbreviation: 'PA', fips: '42'},
      { name: 'PUERTO RICO', abbreviation: 'PR', fips: '72'},
      { name: 'RHODE ISLAND', abbreviation: 'RI', fips: '44'},
      { name: 'SOUTH CAROLINA', abbreviation: 'SC', fips: '45'},
      { name: 'SOUTH DAKOTA', abbreviation: 'SD', fips: '46'},
      { name: 'TENNESSEE', abbreviation: 'TN', fips: '47'},
      { name: 'TEXAS', abbreviation: 'TX', fips: '48'},
      { name: 'UTAH', abbreviation: 'UT', fips: '49'},
      { name: 'VERMONT', abbreviation: 'VT', fips: '50'},
      { name: 'VIRGIN ISLANDS', abbreviation: 'VI', fips: '78'},
      { name: 'VIRGINIA', abbreviation: 'VA', fips: '51'},
      { name: 'WASHINGTON', abbreviation: 'WA', fips: '53'},
      { name: 'WEST VIRGINIA', abbreviation: 'WV', fips: '54'},
      { name: 'WISCONSIN', abbreviation: 'WI', fips: '55'},
      { name: 'WYOMING', abbreviation: 'WY', fips: '56' },
  ];

}
