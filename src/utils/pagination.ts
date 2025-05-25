export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginatedRsponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

//Pagination utility function
export const paginate = async <T>(
    findManyFn: (skip: number, take: number) => Promise<T[]>,
    countFn: () => Promise<number>,
    params: PaginationParams = {}
): Promise<PaginatedRsponse<T>> => {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    //Get data and total count in parallel
    const [data, total] = await Promise.all([
        findManyFn(skip, limit),
        countFn(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
};
