import { people } from '../data/catalog';
import { Card } from '../components/ui';

export default function HomePage() {
  const [researcher, ...supervisors] = people;
  return <div className="compact-home">
    <section className="home-welcome" aria-labelledby="home-title">
      <h1 id="home-title">أهلًا بك في بيئتك التدريبية</h1>
      <p>رحلة لتنمية مهارات دمج التكنولوجيا في التعليم</p>
    </section>
    <section className="research-team" aria-label="الباحثة والمشرفون">
      {researcher && <Card className="person-card researcher-card"><p className="person-role">{researcher.roleLabel}</p><h2>{researcher.displayName}</h2></Card>}
      <h2 className="supervision-heading">إشراف</h2>
      <div className="supervisors-grid">{supervisors.map(person => <Card key={person.id} className="person-card supervisor-card"><h3>{person.displayName}</h3><p className="person-position">{person.position}</p></Card>)}</div>
    </section>
  </div>;
}
