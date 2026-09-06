import type { HourBeat } from "./types";
import { money } from "./utils";

export function launchHours(name: string, price: number): HourBeat[] {
  const p = money(price);
  return [
    {
      hour: 0,
      title: "Name it. Price it. Stop tinkering.",
      task: `Lock the name “${name}” and the price ${p}. Write one sentence: who it is for, what they walk away with. If you cannot say it out loud in one breath, shorten it.`,
    },
    {
      hour: 1,
      title: "Write the actual product",
      task: `Open the Delivery tab and type the pages into a document — or print this kit to PDF. Do not redesign. Fill examples with your own names and numbers. Target: a file you would not be embarrassed to email.`,
    },
    {
      hour: 3,
      title: "Paste the sales page",
      task: "Copy the sales page from this kit. One headline, one problem, one list of what they get, one button. No extra sections. Read it once out loud and cut anything you would skip.",
    },
    {
      hour: 4,
      title: "List it where money already moves",
      task: `Create a Gumroad (or Lemon Squeezy) product. Type: digital. Price: ${p}. Title and description from the listing block. Upload the PDF. Publish. Copy the public URL into a note.`,
    },
    {
      hour: 5,
      title: "Make a cover, not a brand",
      task: "Use the cover prompt in this kit with any image tool. Big type, dark field, one subject. 1:1 for the listing thumbnail. Do not spend a second hour on this.",
    },
    {
      hour: 6,
      title: "First three posts",
      task: "Post the X version, the caption, and the short thread from the Posts tab. Same link in all three. Do not ask permission from an audience you do not have — post as if two specific people will see it.",
    },
    {
      hour: 8,
      title: "Ten honest messages",
      task: "Send the product to 10 people who already trust you: former coworkers, group chats, clients, classmates. Plain text. No funnel. “I made this last night. If it is useful, here is the link. If not, ignore.”",
    },
    {
      hour: 11,
      title: "Two rooms, not twenty",
      task: "Share once in a community where your buyer already lurks, and once in a place you are known. Lead with the problem, not the product. If the room bans links, offer to DM the URL.",
    },
    {
      hour: 16,
      title: "Show the work",
      task: "Post a screenshot of one page of the PDF (not the whole thing) and one sentence about who it is for. People buy finished objects more than promises.",
    },
    {
      hour: 20,
      title: "The last honest push",
      task: "Reply to anyone who asked a question. Post the remaining captions. Email the 10 people who did not answer — once. Then stop performing and wait.",
    },
    {
      hour: 23,
      title: "Count, keep, or kill",
      task: `Log every sale in the barn. If you made money: ship a thank-you and note what people asked. If you made zero: the product still exists. Change the headline tomorrow, not the whole thing.`,
    },
  ];
}
