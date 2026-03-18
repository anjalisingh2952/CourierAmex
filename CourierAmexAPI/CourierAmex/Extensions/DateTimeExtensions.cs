namespace CourierAmex.Web.Extensions
{
    public static class DateTimeExtensions
    {
        static readonly DateTime _epochTime = DateTime.UnixEpoch;
        private static readonly DateTime epoch = DateTime.UnixEpoch;
        private static readonly long TICKS_PER_SECOND = 10000;
        private static readonly TimeSpan epochTimeSpan = new(epoch.Ticks);

        public static long ToEpochTime(this DateTime dateTime)
        {
            TimeSpan span = new TimeSpan(_epochTime.Ticks);
            DateTime time = dateTime.Subtract(span);
            return (time.Ticks / 10000);
        }

        public static long ToEpochTime(this DateTimeOffset dateTime)
        {
            var date = dateTime.ToUniversalTime();
            var ticks = date.Ticks - _epochTime.Ticks;
            var ts = ticks / TimeSpan.TicksPerSecond;
            return ts;
        }

        public static long ToEpochTimeExtended(this DateTime dateTime)
        {
            long unixTime = dateTime.AddHours(-18).ToEpochTime();
            return unixTime;
        }

        public static long ToUnixTime(this DateTime from)
        {
            DateTime d1 = DateTime.UnixEpoch;
            DateTime d2 = from.ToUniversalTime();
            TimeSpan ts = new(d2.Ticks - d1.Ticks);
            return (long)ts.TotalMilliseconds;
        }

        public static DateTime ToDateTimeFromEpoch(this long unixTimestamp)
        {
            long ticks = unixTimestamp * 10000;
            TimeSpan span = new(_epochTime.Ticks);
            DateTime time = new(ticks, DateTimeKind.Local);
            return time.Add(span);
        }

        public static DateTime FromUnixTimeV2(this long unixDateTime)
        {
            DateTime time = new DateTime(unixDateTime * TICKS_PER_SECOND, DateTimeKind.Local).Add(epochTimeSpan);
            return time.ToLocalTime();
        }

        public static DateTimeOffset ToDateTimeOffsetFromEpoch(this long unixTime)
        {
            var timeInTicks = unixTime * TimeSpan.TicksPerSecond;
            return _epochTime.AddTicks(timeInTicks);
        }

        /// <summary>
        /// Gets the 12:00:00 instance of a DateTime
        /// </summary>
        public static DateTime AbsoluteStart(this DateTime dateTime)
        {
            return dateTime.Date;
        }

        /// <summary>
        /// Gets the 11:59:59 instance of a DateTime
        /// </summary>
        public static DateTime AbsoluteEnd(this DateTime dateTime)
        {
            return dateTime.AbsoluteStart().AddDays(1).AddSeconds(-1);
        }

        public static DateTime AppendTime(this DateTime dateTime, string timePart)
        {
            DateTime absoluteStart = dateTime.AbsoluteStart();

            if (!string.IsNullOrEmpty(timePart) && timePart.Contains(':'))
            {
                string[] args = timePart.Split(':');
                int hours = int.Parse(args[0]);
                int minutes = int.Parse(args[1]);
                absoluteStart = absoluteStart.AddHours(hours).AddMinutes(minutes);
            }
            return absoluteStart;
        }
    }
}
