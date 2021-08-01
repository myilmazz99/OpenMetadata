declare module 'Models' {
  export type Match = {
    params: {
      searchQuery: string;
    };
  };
  export type FilterObject = {
    tags: Array<string>;
    service: Array<string>;
    'service type': Array<string>;
    tier: Array<string>;
  };
  export type PaginationProps = {
    sizePerPage: number;
    totalNumberOfValues: number;
    currentPage: number;
    paginate: Function;
  };
  export type Feed = {
    addressedToEntity: {
      description: string;
      href: string;
      id: string;
      name: string;
      type: string;
    };
    from: string;
    message: string;
  };

  export type FeedById = {
    from: string;
    message: string;
    postTs: string;
  };

  export type ServiceOption = {
    id: string;
    description: string;
    jdbc: { connectionUrl: string; driverClass: string };
    name: string;
    serviceType: string;
  };

  export type MockColumn = {
    columnId: number;
    name: string;
    columnDataType: string;
    description: string;
    selected: boolean;
    piiTags?: Array<string>;
  };

  export type ColumnTags = {
    tagFQN: string;
    labelType?: 'Manual' | 'Propagated' | 'Automated' | 'Derived';
    state?: 'Suggested' | 'Confirmed';
  };

  export type TableColumn = {
    name: string;
    columnDataType: string;
    description: string;
    fullyQualifiedName: string;
    tags: Array<ColumnTags>;
    columnConstraint?: string;
    ordinalPosition: number;
  };

  export type Stats = {
    count: number;
    percentileRank: number;
  };

  export type UsageSummary = {
    dailyStats: Stats;
    date: string;
    monthlyStats: Stats;
    weeklyStats: Stats;
  };

  export type ColumnJoin = {
    fullyQualifiedName: string;
    joinCount: number;
  };

  export type ColumnJoins = {
    columnName: string;
    joinedWith: Array<ColumnJoin>;
  };

  export type TableJoinsData = {
    startDate: string;
    dayCount: number;
    columnJoins: Array<ColumnJoins>;
  };

  export type Paging = {
    after: string;
    before: string;
  };

  export type TableDetail = {
    description: string;
    name: string;
    fullyQualifiedName: string;
    columns: Array<TableColumn>;
    database: { name: string };
    owner?: {
      name?: string;
      id: string;
      type: 'user' | 'team';
    };
    tags: Array<ColumnTags>;
    usageSummary: UsageSummary;
    joins: TableJoinsData;
    tier?: string;
  };

  export type Bucket = {
    key: string;
    doc_count: number;
  };
  type AggregationType = {
    title: string;
    buckets: Array<Bucket>;
  };
  export type Sterm = {
    doc_count_error_upper_bound: number;
    sum_other_doc_count: number;
    buckets: Array<Bucket>;
  };

  export interface Aggregation {
    'sterms#Platform': Sterm;
    'sterms#Cluster': Sterm;
    'sterms#Tags': Sterm;
  }
  export type TableEntity = {
    id: string;
    href: string;
    tableType: string;
    fullyQualifiedName: string;
    tableConstraints?: string;
    followers?: Array<string>;
    tags?: Array<string>;
  } & TableDetail;

  export type UserProfile = {
    images: Record<string, string>;
  };

  export type UserTeam = {
    description?: string;
    href?: string;
    id: string;
    name: string;
    type: string;
  };

  export type User = {
    displayName: string;
    isBot: boolean;
    id: string;
    name?: string;
    profile: UserProfile;
    teams: Array<UserTeam>;
    timezone: string;
  };

  export type FormatedTableData = {
    id: string;
    name: string;
    description: string;
    fullyQualifiedName: string;
    owner: string;
    tableType?: string;
    tags: string[];
    tableEntity: TableEntity;
    dailyStats: number;
    weeklyStats: number;
    service?: string;
    tier: string;
  };

  export type NewUser = {
    name: string;
    email: string;
    picture: string;
    // Add other fields from oidc response as necessary
  };

  export type ClientAuth = {
    authority: string;
    client_id: string;
    provider?: 'google' | 'okta' | 'github';
    signingIn?: boolean;
  };

  export type Table = {
    id: string;
    type?: string;
    name: string;
    description: string;
    href: string;
    fullyQualifiedName: string;
  };

  export type StateInfo = {
    count: number;
    percentileRank: number;
  };

  export type UsageState = {
    dailyStats: StateInfo;
    weeklyStats: StateInfo;
    monthlyStats: StateInfo;
    date: string;
  };

  export type Database = {
    description: string;
    fullyQualifiedName: string;
    href: string;
    id: string;
    name: string;
    owner: {
      description: string;
      href: string;
      id: string;
      name: string;
      type: string;
    };
    service: {
      description: string;
      href: string;
      id: string;
      name: string;
      type: string;
    };
    tables: Table[];
    usageSummary: UsageState;
  };

  export type SearchHit = {
    _index?: string;
    _type?: string;
    _id?: string;
    _score?: number;
    _source: FormatedTableData;
  };

  export type SearchResponse = {
    data: {
      hits: {
        total: {
          value: number;
          relation?: string;
        };
        hits: Array<SearchHit>;
      };
      aggregations: Aggregation;
    };
  };
}
