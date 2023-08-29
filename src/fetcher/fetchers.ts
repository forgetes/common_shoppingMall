

async function fetchTopicList (currentPage: number, perPage: number, category: string, search: string) {
    const response  = await fetch(`/api/dataHandler?currentPage=${currentPage}&perPage=${perPage}&category=${category}&search=${search}`)

    return response.json();
}

async function fetchDetailTopic (idx: string) {
    const response  = await fetch(`/api/detailHandler?idx=${idx}`)

    return response.json();
}

export {
    fetchTopicList,
    fetchDetailTopic
}