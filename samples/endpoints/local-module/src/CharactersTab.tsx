import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";

interface Character {
    id: number;
    name: string;
    species: string;
}

export function CharactersTab() {
    const { data: characters } = useSuspenseQuery({ queryKey: ["/api/character/1,2"], queryFn: () => {
        return axios
            .get("/api/character/1,2")
            .then(({ data }) => {
                return data;
            });
    } });

    return (
        <div>
            <h2>Characters</h2>
            <p style={{ backgroundColor: "purple", color: "white", width: "fit-content" }}>This tab is served by <code>@endpoints/local-module</code></p>
            <div>
                {characters.map((x: Character) => {
                    return (
                        <div key={x.id}>
                            <span>Id: {x.id}</span>
                            <span> - </span>
                            <span>Name: {x.name}</span>
                            <span> - </span>
                            <span>Species: {x.species}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const Component = CharactersTab;
