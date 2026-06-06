'use server'

export const createJob = async (newJObData) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newJObData)
    });
    return res.json();
}