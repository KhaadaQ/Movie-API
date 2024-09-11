export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    overview: string;
    release_date: string;
}
export interface MovieDetails extends Movie {
    runtime: number;
    genres: {id:number; name:string}[];
}

export interface ApiResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

const apiKey: string = '5152b58799a81bbff259e2c3fda64a9e';

export async function fetchMoviesByCategory(category:string, page: number = 1):Promise<Movie[]> {
    const apiUrl: string = `https://api.themoviedb.org/3/movie/${category}?api_key=${apiKey}&language=en-US&page=${page}`;

    try {
        const response: Response = await fetch(apiUrl);
        const data: ApiResponse = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error while fetching the movies:', error);
        return [];
        
    }
}


export async function fetchMovies(page: number = 1): Promise<Movie[]> {
    const apiUrl: string = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`;

    try {
        const response: Response = await fetch(apiUrl);
        const data: ApiResponse = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error while fetching the movies:', error);
        return [];
    }
}

export async function fetchMovieDetails(movieId:string): Promise<MovieDetails> {
    const apiUrl: string = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;

    try {
        const response: Response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error while fetching movie details`, error);
        throw new Error('Error fetching movie details');
        
    }

    
}
export async function searchMovies(query:string, page: number = 1): Promise<Movie[]> {
    const apiUrl: string = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${query}&page=${page}`
    try {
        const response: Response = await fetch(apiUrl);
        const data: ApiResponse = await response.json();
        return data.results;
    } catch (error) {
        console.error(error);
        return [];
    }
}