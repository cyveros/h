var config = {
    route: [
        {
            pattern:/^.*forum-\d+-\d+.*$/gi,
            type: 'list'
        },
        {
            pattern:/^.*forumdisplay.*fid=\d+.*?$/gi,
            type: 'list'
        },
        {
            pattern:/^.*thread-\d+-\d+-\d+.*$/gi,
            type: 'detail'
        },
        {
            pattern:/^.*viewthread.*tid=\d+.*$/gi,
            type: 'detail'
        }
    ]
};
