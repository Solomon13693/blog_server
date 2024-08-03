const cron = require('node-cron');

const scheduleReminder =  (post, scheduledTime) => {
    
    const scheduleDateTime = new Date(scheduledTime);

    const currentDateTime = new Date();
    console.log(scheduleDateTime);
    console.log(currentDateTime);

    // Calculate the cron pattern for the scheduled time
    const cronPattern = `${scheduleDateTime.getSeconds()} ${scheduleDateTime.getMinutes()} ${scheduleDateTime.getHours()} ${scheduleDateTime.getDate()} ${scheduleDateTime.getMonth() + 1} *`;

    cron.schedule (cronPattern, async () => {
        const currentDateTime = new Date();

        if (scheduleDateTime <= currentDateTime) {
            post.status = 'published'
            post.published = true
            post.scheduleDate = undefined
            await post.save({ validateBeforeSave: false })
            console.log(`Reminder for task: ${post.slug}`);
        }
    });
};

module.exports = scheduleReminder;
