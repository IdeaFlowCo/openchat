// Transform a name string ("alan duong") into a capitalized first name ("Alan")
export const getFirstName = (name: string): string => {
    return name?.split(" ")[0].charAt(0).toUpperCase() + name?.split(" ")[0].slice(1);
}