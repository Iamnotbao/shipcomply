export const fnQuery = async (queries = [])=>{
    const results = [];
    for (const query of queries) {
        try {
            const res = await query();
            if (res) {
                results.push(res);
            }
        }
        catch (error) {
            console.error("Error executing query:", error);
        }
    }
    return results;

}