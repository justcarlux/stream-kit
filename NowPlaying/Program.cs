
using System.Diagnostics;
using System.Timers;

namespace NowPlaying {
    internal class Program {

        static void Main(string[] args) {

            int interval = 2000;

            try {
                string argument = args[args.Length - 1];
                interval = int.Parse(argument);
            } catch (Exception) { }

            LogSpotifySong();
            System.Timers.Timer timer = new System.Timers.Timer(interval);
            timer.Elapsed += onTimer;
            timer.Start();
            Thread.Sleep(-1);

        }

        private static void onTimer(object? sender, ElapsedEventArgs e) {
            LogSpotifySong();
        }

        private static void LogSpotifySong() {

            string song = "null";
            Process[] processes = Process.GetProcesses();
            foreach (var process in processes)
            {
                if (
                    process.ProcessName.ToLower().Equals("spotify") &&
                    process.MainWindowTitle.Length > 0
                ) {
                    song = process.MainWindowTitle;
                    break;
                }
            }

            if (song.Contains("Spotify")) {
                song = "null";
            }
            Console.WriteLine(song);

        }

    }
}