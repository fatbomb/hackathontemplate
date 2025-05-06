import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    name: "You",
    email: "you@example.com",
    action: "deposited",
    amount: "$250.00",
    date: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@example.com",
    action: "sent you",
    amount: "$150.00",
    date: "5 hours ago",
    status: "completed",
  },
  {
    id: 3,
    name: "Payment",
    email: "payments@example.com",
    action: "subscription renewal",
    amount: "$12.99",
    date: "1 day ago",
    status: "completed",
  },
  {
    id: 4,
    name: "Jane Doe",
    email: "jane@example.com",
    action: "sent you",
    amount: "$35.00",
    date: "3 days ago",
    status: "completed",
  },
  {
    id: 5,
    name: "Withdrawal",
    email: "banking@example.com",
    action: "to bank account",
    amount: "$500.00",
    date: "1 week ago",
    status: "completed",
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div className="flex items-center" key={activity.id}>
          <Avatar className="w-9 h-9">
            <AvatarImage src={`/avatars/0${activity.id}.png`} alt="Avatar" />
            <AvatarFallback>
              {activity.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 ml-4">
            <p className="font-medium text-sm leading-none">
              {activity.name}{" "}
              <span className="text-muted-foreground">{activity.action}</span>
              {" "}{activity.amount}
            </p>
            <p className="text-muted-foreground text-sm">
              {activity.date}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {activity.status === "completed" ? (
              <span className="text-green-500">Completed</span>
            ) : (
              <span className="text-yellow-500">Pending</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}